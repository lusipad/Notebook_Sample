import { NextResponse } from "next/server";

// 1. 模拟内置的企业知识库数据
const KNOWLEDGE_BASE = [
  {
    id: 1,
    title: "产品规格说明书_v2.0.pdf",
    category: "产品参数",
    content: "X100 智能扫地机器人的电池容量为 5200mAh，在标准模式下续航时间可达 150 分钟。充满电需要约 4 小时。吸力高达 4000Pa，噪音控制在 65dB 以下。"
  },
  {
    id: 2,
    title: "售后服务条款_2025版.docx",
    category: "售后政策",
    content: "我们提供 7 天无理由退货和 15 天质量问题换货服务。整机保修期为 2 年，电池及电机等核心部件保修期为 3 年。人为损坏不在保修范围内。"
  },
  {
    id: 3,
    title: "常见故障排查手册.pdf",
    category: "故障排除",
    content: "如果机器人无法回充，请检查充电座指示灯是否亮起，并确保充电座左右 0.5 米及前方 1.5 米范围内无障碍物。请定期清理充电触片上的灰尘。"
  }
];

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const userQuery = message.toLowerCase();

    // 2. 简单的关键词检索逻辑 (模拟 RAG)
    // 在真实场景中，这里会调用向量数据库或 Google Vertex AI Search
    const relevantDocs = KNOWLEDGE_BASE.filter(doc => {
      const keywords = doc.content.toLowerCase().split(/[\s,，。]+/);
      // 只要命中任意关键词就算相关（简单模拟）
      return keywords.some(k => k.length > 1 && userQuery.includes(k)) || 
             doc.content.includes(userQuery) ||
             (userQuery.includes("退") && doc.category === "售后政策") ||
             (userQuery.includes("电") && doc.category === "产品参数");
    });

    // 如果没有找到相关文档，使用默认文档
    const citedDocs = relevantDocs.length > 0 ? relevantDocs : [KNOWLEDGE_BASE[0]];

    // 3. 模拟 AI 基于检索到的文档生成回答
    // 这里我们手动构造一个看起来像是基于文档回答的格式
    let answer = "";
    
    if (userQuery.includes("续航") || userQuery.includes("电池")) {
      answer = `根据产品规格说明书，X100 扫地机器人的**电池容量为 5200mAh**。

在标准模式下，它的续航时间可以达到 **150 分钟**，这通常足以覆盖 150 平方米左右的清洁面积。请注意，充满电大约需要 4 小时。`;
    } else if (userQuery.includes("保修") || userQuery.includes("退货")) {
      answer = `关于售后服务，我们提供以下保障：

*   **退换货**：支持 7 天无理由退货及 15 天质量换货。
*   **保修期**：整机保修 **2 年**，核心部件（电池、电机）保修 **3 年**。

请注意，人为损坏不在保修范围内。`;
    } else if (userQuery.includes("思维导图") || userQuery.includes("mind map") || userQuery.includes("结构")) {
      answer = `好的，根据现有文档，我为您梳理了 X100 智能机器人的核心知识点结构：

\`\`\`mermaid
mindmap
  root((X100 扫地机器人))
    核心参数
      吸力: 4000Pa
      续���: 150分钟
      电池: 5200mAh
      噪音: <65dB
    售后保障
      整机保修: 2年
      核心部件: 3年
      退换货: 7天无理由
    常见故障
      无法回充: 检查充电座
      吸力下降: 清理滤网
\`\`\`

您可以点击图表中的节点来展开思考（模拟功能）。`;
    } else {
      // 通用回答
      answer = `我查阅了知识库，发现以下相关信息：

${citedDocs[0].content}

如果您有具体关于续航、保修或故障排查的问题，请告诉我。`;
    }

    // 模拟网络延迟，增加真实感
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({
      answer: answer,
      // 关键：返回引用的源文档详细信息，供前��展示
      citations: citedDocs.map(doc => ({
        id: doc.id,
        title: doc.title,
        content: doc.content // 将原文片段返回给前端
      }))
    });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}