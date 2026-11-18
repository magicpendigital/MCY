import { MobileScroll, useFlow } from "../../mobile";
import { DemoNote, Eyebrow } from "../../app/ui/controls";
import { AccountRow } from "../../app/ui/AccountRow";
import { useRoutes } from "../../app/navigation";
import { HELP_ARTICLES, type HelpArticleId } from "./articles";

export function HelpArticleScreen({ articleId }: { articleId: HelpArticleId }) {
  const flow = useFlow();
  const routes = useRoutes();
  const article = HELP_ARTICLES.find(item => item.id === articleId) ?? HELP_ARTICLES[0];
  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-discover-detail">
    <Eyebrow>HƯỚNG DẪN SỬ DỤNG</Eyebrow>
    <h1>{article.title}</h1>
    <p className="mcy-lead">{article.lead}</p>
    <section className="mcy-article-body">{article.paragraphs.map((paragraph, index) => <p key={`${article.id}-${index}`}>{paragraph}</p>)}</section>
    {article.id === "ai-scope" && <AccountRow title="Mở cài đặt quyền riêng tư" detail="Xem hoặc thay đổi lựa chọn AI" onClick={() => flow.push(routes.privacy)} />}
    <DemoNote>Hướng dẫn sử dụng chung, không thay thế tư vấn y tế. Nếu cần hỗ trợ tài khoản hoặc dữ liệu, hiện chưa có kênh gửi yêu cầu trong ứng dụng.</DemoNote>
  </main></MobileScroll>;
}
