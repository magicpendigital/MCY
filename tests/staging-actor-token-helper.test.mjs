import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import test from "node:test";

const helperSource = readFileSync(
  new URL("../scripts/setup-staging-actor-tokens.ps1", import.meta.url),
  "utf8",
);
const variables = [
  "MCY_TEST_LEARNER_A_ACCESS_TOKEN",
  "MCY_TEST_LEARNER_B_ACCESS_TOKEN",
  "MCY_TEST_TEACHER_ACCESS_TOKEN",
  "MCY_TEST_REVIEWER_ACCESS_TOKEN",
  "MCY_TEST_OWNER_ACCESS_TOKEN",
];
const baseLines = [
  "# Fictional offline fixture; never load the workspace .env.local.",
  "VITE_SUPABASE_URL=https://mhumbczqrzutdnraafhs.supabase.co",
  "VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_offline_fixture",
  "UNRELATED_SETTING='Bình yên'",
];
const windowsOnly = {
  skip: process.platform !== "win32" && "Requires Windows PowerShell 5.1; not staging evidence.",
};

function psString(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

function runFixture(original, mode = "success", authOptions = {}) {
  const root = mkdtempSync(join(tmpdir(), "mcy-actor-token-test-"));
  try {
    const scriptsPath = join(root, "scripts");
    const envPath = join(root, ".env.local");
    const helperPath = join(scriptsPath, "setup-staging-actor-tokens.ps1");
    mkdirSync(scriptsPath);
    writeFileSync(helperPath, helperSource, "utf8");
    writeFileSync(envPath, original, "utf8");

    // Execute the entire unmodified helper, but replace its interactive, Git and
    // HTTP boundaries. Its PSScriptRoot points only at the disposable fixture.
    const harness = `
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$global:mcyOfflineFixture = [pscustomobject]@{
  Mode = ${psString(mode)}
  EnvPath = ${psString(envPath)}
  AuthCalls = 0
  DestinationLock = $null
  EmailLabels = @()
  RetryPrompts = 0
  AuthOptions = (${psString(JSON.stringify({ failureCalls: [], duplicateCalls: [], retry: false, httpStatus: 400, errorCode: "invalid_credentials", bodyMode: "details", ...authOptions }))} | ConvertFrom-Json)
}
if ($global:mcyOfflineFixture.AuthOptions.failureCalls.Count -gt 0) {
  Add-Type -TypeDefinition @'
public class McyOfflineWebResponse : System.Net.WebResponse {
  public System.Net.HttpStatusCode StatusCode { get; private set; }
  private readonly string body;
  public McyOfflineWebResponse(int status, string body) {
    this.StatusCode = (System.Net.HttpStatusCode)status;
    this.body = body;
  }
  public override System.IO.Stream GetResponseStream() {
    return new System.IO.MemoryStream(System.Text.Encoding.UTF8.GetBytes(this.body));
  }
}
'@
}
function Throw-FixtureAuthFailure {
  [CmdletBinding()]
  param()
  $options = $global:mcyOfflineFixture.AuthOptions
  if ($options.transport) {
    throw (New-Object System.Net.WebException('offline-auth-error-canary', [System.Net.WebExceptionStatus]$options.transport))
  }
  $fixtureBody = @{
    code = $options.httpStatus
    error_code = $options.errorCode
    msg = 'offline-password-canary fixture-0@example.invalid offline-token-canary'
  }
  if ($options.bodyMode -eq 'new_code') {
    $fixtureBody.Remove('error_code')
    $fixtureBody.code = $options.errorCode
  }
  if ($options.bodyMode -in @('oversized', 'stream_oversized')) {
    $fixtureBody.msg += ('x' * 8193)
  }
  $fixtureJson = if ($options.bodyMode -eq 'malformed') {
    '{invalid-json offline-token-canary offline-password-canary'
  } else { $fixtureBody | ConvertTo-Json -Compress }
  $fixtureResponse = New-Object McyOfflineWebResponse($options.httpStatus, $fixtureJson)
  $fixtureException = New-Object System.Net.WebException(
    'offline-auth-error-canary', $null,
    [System.Net.WebExceptionStatus]::ProtocolError, $fixtureResponse
  )
  $fixtureError = New-Object System.Management.Automation.ErrorRecord(
    $fixtureException, 'OfflineAuthFailure',
    [System.Management.Automation.ErrorCategory]::AuthenticationError, $null
  )
  if ($options.bodyMode -notin @('stream', 'stream_oversized')) {
    $fixtureError.ErrorDetails = New-Object System.Management.Automation.ErrorDetails($fixtureJson)
  }
  $PSCmdlet.ThrowTerminatingError($fixtureError)
}
function git {
  if (($args -join ' ') -notin @('check-ignore -q -- .env.local', 'check-ignore -q .env.local')) {
    throw "Unexpected Git operation in offline fixture: $($args -join ' ')."
  }
  $global:LASTEXITCODE = if ($global:mcyOfflineFixture.Mode -eq 'not_ignored') { 1 } else { 0 }
}
function Read-Host {
  param([string]$Prompt, [switch]$AsSecureString)
  if ($AsSecureString) {
    return (ConvertTo-SecureString 'offline-password-canary' -AsPlainText -Force)
  }
  if ($Prompt.StartsWith('Retry only ')) {
    $global:mcyOfflineFixture.RetryPrompts++
    return $(if ($global:mcyOfflineFixture.AuthOptions.retry) { 'y' } else { 'n' })
  }
  $global:mcyOfflineFixture.EmailLabels += [regex]::Match($Prompt, '\\(([^)]+)\\)').Groups[1].Value
  return "fixture-$($global:mcyOfflineFixture.AuthCalls)@example.invalid"
}
function Invoke-RestMethod {
  param($Method, $Uri, $Headers, $ContentType, $Body, $TimeoutSec)
  $global:mcyOfflineFixture.AuthCalls++
  if ($Method -ne 'Post' -or
      $Uri -ne 'https://mhumbczqrzutdnraafhs.supabase.co/auth/v1/token?grant_type=password' -or
      $Headers.apikey -ne 'sb_publishable_offline_fixture' -or
      $ContentType -ne 'application/json' -or $TimeoutSec -ne 20) {
    throw 'Unexpected request in offline fixture; no network request was sent.'
  }
  $payload = $Body | ConvertFrom-Json
  if ($payload.password -ne 'offline-password-canary' -or
      $payload.email -ne "fixture-$($global:mcyOfflineFixture.AuthCalls - 1)@example.invalid") {
    throw 'Unexpected fictional credentials.'
  }
  if ($global:mcyOfflineFixture.Mode -eq 'auth_error' -and $global:mcyOfflineFixture.AuthCalls -eq 2) {
    throw 'offline-auth-error-canary offline-password-canary'
  }
  if ($global:mcyOfflineFixture.AuthOptions.failureCalls -contains $global:mcyOfflineFixture.AuthCalls) {
    Throw-FixtureAuthFailure
  }
  if ($global:mcyOfflineFixture.Mode -eq 'locked_destination' -and $global:mcyOfflineFixture.AuthCalls -eq 5) {
    $global:mcyOfflineFixture.DestinationLock = [System.IO.File]::Open(
      $global:mcyOfflineFixture.EnvPath, [System.IO.FileMode]::Open,
      [System.IO.FileAccess]::Read, [System.IO.FileShare]::None
    )
  }
  $identity = if ($global:mcyOfflineFixture.Mode -eq 'duplicate_actor' -or
                  $global:mcyOfflineFixture.AuthOptions.duplicateCalls -contains $global:mcyOfflineFixture.AuthCalls) {
    1
  } else { $global:mcyOfflineFixture.AuthCalls }
  return [pscustomobject]@{
    access_token = "offline-token-canary-$($global:mcyOfflineFixture.AuthCalls)"
    user = [pscustomobject]@{ id = "fictional-user-$identity" }
  }
}
$fixtureExitCode = 0
try {
  & ${psString(helperPath)}
} catch {
  [Console]::Error.WriteLine($_.Exception.Message)
  [Console]::Error.WriteLine("MCY_OFFLINE_EXCEPTION_TYPE=$($_.Exception.GetBaseException().GetType().FullName)")
  $fixtureExitCode = 1
} finally {
  if ($global:mcyOfflineFixture.DestinationLock) { $global:mcyOfflineFixture.DestinationLock.Dispose() }
}
Write-Output "MCY_OFFLINE_POWERSHELL=$($PSVersionTable.PSVersion);$($PSVersionTable.PSEdition)"
Write-Output "MCY_OFFLINE_CALLS=$($global:mcyOfflineFixture.AuthCalls)"
Write-Output "MCY_OFFLINE_EMAIL_LABELS=$($global:mcyOfflineFixture.EmailLabels -join '|')"
Write-Output "MCY_OFFLINE_RETRY_PROMPTS=$($global:mcyOfflineFixture.RetryPrompts)"
exit $fixtureExitCode
`;
    const harnessPath = join(scriptsPath, "offline-test-harness.ps1");
    // A BOM lets PowerShell 5.1 read non-ASCII fixture paths correctly.
    writeFileSync(harnessPath, "\uFEFF" + harness, "utf8");
    // Do not inherit Supabase/AI/session environment variables or load dotenv.
    const childEnvironment = Object.fromEntries(
      Object.entries(process.env).filter(([name]) =>
        /^(systemroot|windir|path|temp|tmp|comspec)$/i.test(name),
      ),
    );
    const result = spawnSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-OutputFormat",
        "Text",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        harnessPath,
      ],
      { cwd: root, env: childEnvironment, encoding: "utf8", timeout: 20_000, windowsHide: true },
    );
    assert.ifError(result.error);
    const output = result.stdout + result.stderr;
    assert.match(output, /MCY_OFFLINE_POWERSHELL=5\.1\.[^;\r\n]+;Desktop/);
    assert.doesNotMatch(output, /offline-(?:token|password|auth-error)-canary/);
    assert.doesNotMatch(output, /fixture-\d+@example\.invalid/);
    return {
      status: result.status,
      output,
      content: readFileSync(envPath, "utf8"),
      files: readdirSync(root).sort(),
    };
  } finally {
    // Delete only the exact synthetic directory created above, never the repo.
    assert.equal(realpathSync(dirname(root)), realpathSync(tmpdir()));
    assert.ok(basename(root).startsWith("mcy-actor-token-test-"));
    rmSync(root, { recursive: true, force: true });
  }
}

function assertFailure(result, original, authCalls, message) {
  assert.equal(result.status, 1, result.output);
  assert.equal(result.content, original);
  assert.match(result.output, new RegExp(`MCY_OFFLINE_CALLS=${authCalls}(?:\\r?\\n|$)`));
  assert.match(result.output, message);
  assert.deepEqual(result.files, [".env.local", "scripts"]);
  assert.doesNotMatch(result.output, /Saved five distinct/);
}

test("PowerShell 5.1 saves five tokens atomically, preserving CRLF and unrelated settings", windowsOnly, () => {
  const prefixes = variables.map((variable) => `  ${variable} =`);
  const original = [...baseLines, ...prefixes.map((prefix) => `${prefix}old-fixture-value`)].join("\r\n") + "\r\n";
  const expected = [...baseLines, ...prefixes.map((prefix, index) => `${prefix}offline-token-canary-${index + 1}`)].join("\r\n") + "\r\n";
  const result = runFixture(original);
  assert.equal(result.status, 0, result.output);
  assert.equal(result.content, expected);
  assert.match(result.output, /MCY_OFFLINE_CALLS=5/);
  assert.match(result.output, /Saved five distinct/);
  assert.deepEqual(result.files, [".env.local", "scripts"]);
});

test("PowerShell 5.1 appends missing tokens without changing LF or adding a final newline", windowsOnly, () => {
  const original = baseLines.join("\n");
  const expected = original + "\n" + variables.map((variable, index) => `${variable}=offline-token-canary-${index + 1}`).join("\n");
  const result = runFixture(original);
  assert.equal(result.status, 0, result.output);
  assert.equal(result.content, expected);
  assert.deepEqual(result.files, [".env.local", "scripts"]);
});

test("an unignored env file is rejected before authentication", windowsOnly, () => {
  const original = baseLines.join("\n");
  assertFailure(runFixture(original, "not_ignored"), original, 0, /not ignored by Git/);
});

test("a non-staging origin is rejected before authentication", windowsOnly, () => {
  const original = baseLines.join("\n").replace("https://mhumbczqrzutdnraafhs.supabase.co", "https://production.example.invalid");
  assertFailure(runFixture(original), original, 0, /locked to the mcy-staging project/);
});

test("a non-publishable key is rejected before authentication", windowsOnly, () => {
  const original = baseLines.join("\n").replace("sb_publishable_offline_fixture", "fictional-server-key");
  assertFailure(runFixture(original), original, 0, /only the staging publishable key is accepted/);
});

test("duplicate account identities leave the original env unchanged", windowsOnly, () => {
  const original = baseLines.join("\n");
  assertFailure(runFixture(original, "duplicate_actor"), original, 2, /Could not authenticate learner B/);
});

test("authentication errors are sanitized and leave the original env unchanged", windowsOnly, () => {
  const original = baseLines.join("\n");
  assertFailure(runFixture(original, "auth_error"), original, 2, /Could not authenticate learner B/);
});

test("a failed atomic replacement preserves the destination and removes the token temp file", windowsOnly, () => {
  const original = baseLines.join("\n");
  const result = runFixture(original, "locked_destination");
  assertFailure(result, original, 5, /Exception calling "Replace"/);
  assert.match(result.output, /MCY_OFFLINE_EXCEPTION_TYPE=System\.IO\.IOException/);
});

test("an Owner credential failure reports a safe code and cancellation leaves all tokens unsaved", windowsOnly, () => {
  const original = baseLines.join("\n");
  const result = runFixture(original, "success", { failureCalls: [5] });
  assertFailure(result, original, 5, /invalid_credentials; HTTP 400/);
  assert.match(result.output, /MCY_OFFLINE_RETRY_PROMPTS=1/);
  assert.match(result.output, /Setup cancelled at owner/);
});

test("manual Owner retry keeps the first four accounts in memory and saves only the successful attempt", windowsOnly, () => {
  const original = baseLines.join("\n");
  const result = runFixture(original, "success", { failureCalls: [5], retry: true });
  const expected = original + "\n" + variables.map((variable, index) => `${variable}=offline-token-canary-${index === 4 ? 6 : index + 1}`).join("\n");
  assert.equal(result.status, 0, result.output);
  assert.equal(result.content, expected);
  assert.match(result.output, /MCY_OFFLINE_EMAIL_LABELS=learner A\|learner B\|teacher\|reviewer\|owner\|owner/);
  assert.match(result.output, /MCY_OFFLINE_CALLS=6/);
  assert.match(result.output, /MCY_OFFLINE_RETRY_PROMPTS=1/);
  assert.deepEqual(result.files, [".env.local", "scripts"]);
});

test("credential retries stop after three attempts for that actor without a partial save", windowsOnly, () => {
  const original = baseLines.join("\n");
  const result = runFixture(original, "success", { failureCalls: [5, 6, 7], retry: true });
  assertFailure(result, original, 7, /Stopped at owner: invalid_credentials/);
  assert.match(result.output, /MCY_OFFLINE_RETRY_PROMPTS=2/);
  assert.match(result.output, /MCY_OFFLINE_EMAIL_LABELS=learner A\|learner B\|teacher\|reviewer\|owner\|owner\|owner(?:\r?\n|$)/);
});

test("a duplicate actor can be corrected manually but its token is never accepted", windowsOnly, () => {
  const original = baseLines.join("\n");
  const result = runFixture(original, "success", { duplicateCalls: [2], retry: true });
  const acceptedCalls = [1, 3, 4, 5, 6];
  const expected = original + "\n" + variables.map((variable, index) => `${variable}=offline-token-canary-${acceptedCalls[index]}`).join("\n");
  assert.equal(result.status, 0, result.output);
  assert.equal(result.content, expected);
  assert.match(result.output, /duplicate_actor; HTTP status unavailable/);
  assert.match(result.output, /MCY_OFFLINE_EMAIL_LABELS=learner A\|learner B\|learner B\|teacher\|reviewer\|owner/);
  assert.match(result.output, /MCY_OFFLINE_CALLS=6/);
  assert.match(result.output, /MCY_OFFLINE_RETRY_PROMPTS=1/);
});

for (const [name, options, message] of [
  ["unconfirmed email", { errorCode: "email_not_confirmed" }, /email_not_confirmed; HTTP 400/],
  ["disabled account", { errorCode: "user_banned" }, /user_banned; HTTP 400/],
  ["CAPTCHA failure", { errorCode: "captcha_failed" }, /captcha_failed; HTTP 400/],
  ["HTTP rate limit", { httpStatus: 429 }, /over_request_rate_limit; HTTP 429/],
  ["HTTP server failure", { httpStatus: 503 }, /auth_server_error; HTTP 503/],
  ["transport timeout", { transport: "Timeout" }, /request_timeout; HTTP status unavailable/],
  ["DNS failure", { transport: "NameResolutionFailure" }, /network_error; HTTP status unavailable/],
  ["unknown provider code", { errorCode: "offline-token-canary-untrusted-code" }, /auth_unknown; HTTP 400/],
  ["malformed response", { bodyMode: "malformed" }, /auth_unknown; HTTP 400/],
  ["oversized error details", { bodyMode: "oversized" }, /auth_unknown; HTTP 400/],
  ["oversized response stream", { bodyMode: "stream_oversized" }, /auth_unknown; HTTP 400/],
]) {
  test(`${name} is safely distinguished and never offers or sends a retry`, windowsOnly, () => {
    const original = baseLines.join("\n");
    const result = runFixture(original, "success", { failureCalls: [5], retry: true, ...options });
    assertFailure(result, original, 5, message);
    assert.match(result.output, /MCY_OFFLINE_RETRY_PROMPTS=0/);
  });
}

for (const bodyMode of ["stream", "new_code"]) {
  test(`PowerShell 5.1 reads allowlisted Auth codes from ${bodyMode} without printing the response`, windowsOnly, () => {
    const original = baseLines.join("\n");
    const result = runFixture(original, "success", { failureCalls: [5], bodyMode });
    assertFailure(result, original, 5, /invalid_credentials; HTTP 400/);
  });
}
