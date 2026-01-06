<template>
  <div>
    <ul class="list">
      <li v-for="(item,index) in alllCase" :key="item">
        <b style="font-size: 1.5em;">{{ index+1 }}</b>
        <div style="white-space: pre-line" v-html="item"></div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, watch } from "vue";

// 数据与逻辑
const scratchItems = [
  {
    query: "microsoft-report",
    method: "scratch",
    text: '"Research and write analysis report on Microsoft\'s latest earnings"',
  },
  {
    query: "meeting-minutes",
    method: "scratch",
    text: '"Create meeting minutes from recorded discussion"',
  },
  {
    query: "proposal",
    method: "scratch",
    text: '"Write project proposal with timeline, budget, and deliverables"',
  },
  {
    query: "daily-schedule",
    method: "scratch",
    text: '"Create a comprehensive and well-organized daily schedule"',
  },
];
const templateItems = [
  {
    query: "architecture-newsletter",
    method: "template",
    text: '"Create an October 2025 client newsletter for our architecture studio"',
  },
  {
    query: "back-to-school-newsletter",
    method: "template",
    text: '"Design back-to-school newsletter for elementary school families"',
  },
  {
    query: "basic-menu",
    method: "template",
    text: '"Create polished menu for backyard birthday dinner with three courses"',
  },
  {
    query: "architecture-brochure",
    method: "template",
    text: '"Design professional brochure for architecture firm showcasing projects"',
  },
];
const editItems = [
  {
    query: "rewrite",
    text: '"Rewrite this section to be more professional and concise"',
  },
  {
    query: "summarize",
    text: '"Summarize this 20-page report into 2-page executive summary"',
  },
  {
    query: "translate",
    text: '"Translate document to English while preserving all formatting"',
  },
  { query: "add-toc", text: '"Add table of contents"' },
];

// 默认信息（可根据需要扩展）
const queryDefaultInfo = {
  "microsoft-report": `Company: Microsoft Corporation\nFiscal Quarter: Q1 FY2026\nKey Focus Areas: Cloud revenue growth, AI services impact, Azure performance, Office 365 adoption\nComparison Period: Q1 FY2025 and Q4 FY2025\nInclude: Revenue breakdown by segment, year-over-year growth rates, operating margins, strategic initiatives\nTone: Professional financial analysis for investors and stakeholders`,
  "meeting-minutes": `Meeting: Product Strategy Planning Session\nDate: October 22, 2024\nAttendees: Sarah Chen (CEO), Mike Johnson (CTO), Lisa Park (CPO), Tom Wilson (CFO)\nDuration: 2 hours\nKey Decisions:\n- Approved $2M budget for AI feature development\n- Q1 2025 product roadmap finalized\n- New pricing strategy for enterprise tier\nAction Items:\n- Mike to hire 3 ML engineers by November\n- Lisa to conduct user research on proposed features\n- Tom to prepare financial projections for board meeting\nFollow-up: Weekly sync meetings starting next Monday`,
  proposal: `Meeting: Product Strategy Planning Session\nDate: October 22, 2024\nAttendees: Sarah Chen (CEO), Mike Johnson (CTO), Lisa Park (CPO), Tom Wilson (CFO)\nDuration: 2 hours\nKey Decisions:\n- Approved $2M budget for AI feature development\n- Q1 2025 product roadmap finalized\n- New pricing strategy for enterprise tier\nAction Items:\n- Mike to hire 3 ML engineers by November\n- Lisa to conduct user research on proposed features\n- Tom to prepare financial projections for board meeting\nFollow-up: Weekly sync meetings starting next Monday. Please read "reports/proposal.md" for more detail informations.`,
  rewrite: `None`,
  summarize: `Key sections to focus on:\n- Strategic objectives and business value proposition\n- Budget breakdown by phase and resource allocation\n- Critical milestones and timeline dependencies\n- Risk mitigation strategies and contingency plans\n- ROI projections and success metrics (35% cost reduction, 50% processing improvement)\n- Technology stack and infrastructure decisions\n- Resource requirements and team composition`,
  translate: `None`,
  "add-toc": `None`,
  "architecture-newsletter": `Studio: Skyline Atelier Architects\nMain Story: City greenlights North Pier Community Library; groundbreaking set for Oct 28\nSections to Include:\n- Library milestone & neighborhood impact\n- Market snapshot: office-to-residential conversions in top 5 US metros\n- Design trend: mass timber + carbon benefits\n- Practical guide: harnessing natural light in buildings\n- Team spotlight: Maya Ortega, AIA Chicago Emerging Professionals Award winner\n- Events: open studio, ribbon cutting, breakfast talk\nTone: Professional, approachable, client-facing`,
  "back-to-school-newsletter": `School: Roosevelt Middle School\nIssue: September 2025 "Back to School" edition\nPrincipal: Dr. Elena Alvarez\nSections to Include:\n- Welcome message with campus updates\n- Upcoming events calendar\n- Recent school highlights\n- Counselors' updates and resources\n- Monthly focus: Attendance & Kindness\n- Book recommendation\n- Inspirational quote\nContact Info: office: 718-555-0145 | ealvarez@rooseveltrms.org | rooseveltrms.org | @RMSRockets\nTone: Friendly, informative, community-oriented`,
  "basic-menu": `Event: Mia's 30th Candlelight Supper\nVibe: Cozy early-autumn; backyard string lights; 14 guests\nDietary: No peanuts; Jess is vegetarian\n\nSelected Courses:\n✓ First bite: Roasted squash + apple soup\n  - butternut and Honeycrisp roasted with sage and nutmeg\n  - blended with coconut milk; swirl of maple-coconut cream\n  - finish with toasted pepitas for crunch\n\n✓ The big plate: Red wine–braised short ribs on parmesan polenta\n  - slow 4-hour braise with garlic, thyme, and a strip of orange peel\n  - glossy pan sauce over creamy polenta\n  - side: charred broccolini with lemon zest\n  - veg backup: wild mushroom risotto with herbs (for Jess)\n\n✓ Sweet ending: Brown butter apple crisp + vanilla bean ice cream\n  - Granny Smith and Honeycrisp; cinnamon and cardamom\n  - oat-almond crumble; warm salted caramel drizzle\n  - serve with a scoop of vanilla bean ice cream\n\nStyle: Warm, tempting descriptions that match the cozy autumn atmosphere`,
  "architecture-brochure": `Firm: Harborline Design — Architecture + Interiors\nTagline: Design for coasts and communities\nBackground: Founded in 2014, minority-owned studio in Boston's Seaport focusing on adaptive reuse and waterfront projects\nKey Differentiators:\n- 70+ projects in New England\n- Licensed in MA, RI, NH; MBE certified\n- Energy models on every project; 32% lower EUI than code baseline\n- Community-first engagement process\nSections Needed:\n- Company background\n- Featured projects with images\n- Services offered\n- Design process\n- Team/hiring information\n- Awards & recognition\n- Contact information\nStyle: Clean, modern, professional with coastal influence`,
  "daily-schedule": `Person: Alex Kim\nRole: Graduate student and part-time software developer\nDate: Monday, October 28, 2025\nSchedule Requirements:\n\nWake up time: 6:30 AM\nWork hours: Remote software development (2:00 PM - 6:00 PM)\nClass schedule: Two graduate classes (Database Systems 9:00-10:30 AM, Machine Learning 11:00 AM-12:30 PM)\nGym session: 7:00-8:00 AM\nMeal times: Breakfast, lunch, dinner with specific time blocks\nStudy/homework blocks: 2-3 hours distributed throughout the day\nPersonal time: 1 hour for hobbies/relaxation\nSleep target: 11:00 PM\n\nAdditional Elements to Include:\n\nMorning routine (meditation, breakfast prep)\nCommute times if applicable\nShort breaks between activities\nEvening wind-down routine\nImportant reminders (team meeting at 3 PM, assignment due Wednesday)\nOptional buffer time for flexibility\n\nTone: Practical, motivating, balanced between productivity and self-care\nFormat: Clean visual layout with time blocks, easy to scan, includes priority markers or notes where helpful`,
};

let alllCase = ref([]);
let arr = scratchItems.concat(templateItems).concat(editItems);
for (let i = 0; i < arr.length; i++) {
  const item = arr[i];
  let str = `${item.text} \n ${queryDefaultInfo[item.query]}`;
  alllCase.value.push([str]);
}
</script>

<style scoped lang="scss">
ul.list {
  li {
    margin: 40px 20px;
    padding: 20px;
    background: #eee;
  }
  // li:nth-of-type(odd){
  //  background: #ddd;
  // }
}
</style>