import{_ as q,a as H,r as f,b as z,w as P,o as c,d,e as t,F as I,f as T,g as w,h as N,v as F,i as R,j as D,n as $,k as E,l as B,t as _,m as L,p as j}from"./index-Dz5INiKS.js";const W=""+new URL("OfficeCLI-D9GmFvvI.jpg",import.meta.url).href,J=s=>{if(!s&&s!==0)return"";const l=document.createElement("div");return l.textContent=s,l.innerHTML},K=s=>({"fa-search-plus":"🔍","fa-file-alt":"📄","fa-plug":"🔌","fa-file-word":"📝","fa-pen":"✍️","fa-brain":"🧠","fa-file-lines":"📋","fa-list-check":"✅","fa-compress":"📊","fa-magnifying-glass":"🔎","fa-file":"📁","fa-code":"💻","fa-database":"🗄️","fa-chart-bar":"📊"})[s]||"🔧",G=s=>{s=J(s);const l=[],h=[];s=s.replace(/(\/\/.*$)/gm,i=>{const o=h.length;return h.push(`<span class="comment">${i}</span>`),`__COMMENT_${o}__`}),s=s.replace(/(\/\*[\s\S]*?\*\/)/g,i=>{const o=h.length;return h.push(`<span class="comment">${i}</span>`),`__COMMENT_${o}__`}),s=s.replace(/(`[^`]*`)/g,i=>{const o=l.length;return l.push(`<span class="string">${i}</span>`),`__STRING_${o}__`}),s=s.replace(/('[^']*')/g,i=>{const o=l.length;return l.push(`<span class="string">${i}</span>`),`__STRING_${o}__`}),s=s.replace(/("[^"]*")/g,i=>{const o=l.length;return l.push(`<span class="string">${i}</span>`),`__STRING_${o}__`});const u=["const","let","var","function","async","await","return","if","else","for","while","do","switch","case","break","continue","try","catch","finally","throw","new","class","extends","import","export","from","default","typeof","instanceof"],r=new RegExp(`\\b(${u.join("|")})\\b`,"g");return s=s.replace(r,'<span class="keyword">$1</span>'),s=s.replace(/\b(\d+\.?\d*)\b/g,'<span class="number">$1</span>'),s=s.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,'<span class="function">$1</span>('),s=s.replace(/\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g,'.<span class="property">$1</span>'),h.forEach((i,o)=>{s=s.replace(`__COMMENT_${o}__`,i)}),l.forEach((i,o)=>{s=s.replace(`__STRING_${o}__`,i)}),s},U=async(s,{onStart:l,onDelta:h,onEnd:u,onError:r})=>{const i=new AbortController;try{const o=await fetch("http://20.1.170.90:2233/chat",{method:"POST",signal:i.signal,headers:{"Content-Type":"application/json",Accept:"text/event-stream"},body:JSON.stringify(s)});if(console.log("连接成功:",o),!o.ok){const m=await o.text();try{const g=JSON.parse(m).error;console.error("❌ API Error:",g.code,g.message),r==null||r(g)}catch{console.error("❌ Unknown Error:",m),r==null||r(m)}return}const k=o.body.getReader(),y=new TextDecoder("utf-8");let x="",C="";for(;;){const{value:m,done:g}=await k.read();if(g)break;y.decode(m,{stream:!0}).split(`
`).forEach(S=>{if(S.startsWith("data: ")){const b=JSON.parse(S.substring(6));b.type==="delta"?h(b.delta):b.type==="end"&&u()}})}}catch(o){o.name==="AbortError"?console.warn("⚠️ Request aborted"):console.error("❌ Network Error:",o),r==null||r(o)}},Q={class:$(["light-theme","demo-page"]),id:"app"},V={id:"demoPage"},Y={class:"app-container"},Z={class:"chat-panel"},X={key:0,class:"conv-header"},ee={key:1,class:"conv-header assistant-header",style:{"margin-bottom":"12px"}},te=["textContent"],ne=["textContent"],se={class:"tool-call-header"},oe={class:"tool-icon"},ae={class:"tool-name"},re={class:"tool-goal"},ie={key:0,class:"action-code-collapsible"},le=["onClick"],ce={class:"action-code-content"},de=["innerHTML"],ue={class:"chat-input-container",style:{position:"relative"}},pe={key:0,class:"example-ul",style:{}},he=["data-query","onClick"],fe={class:"query-text"},me={class:"input-wrapper"},ge=["placeholder","onKeydown"],ye=["disabled"],ve={key:0,class:"fas fa-paper-plane"},_e={key:1,class:"fas fa-spinner fa-spin"},be={class:"preview-panel"},we={class:"preview-content",id:"previewContent"},ke={key:0,style:{width:"100%",height:"100%",display:"flex","flex-direction":"column"}},Ce={__name:"ChatBox",props:{sessionId:String},setup(s){const l=s,h=H();f("Document Preview"),f("Waiting for generation...");const u=f(null),r=f([]),i=f(""),o=f(!1),k=f(null);f();const y=f({});function x(a){if(!a)return;const n=JSON.parse(localStorage.getItem("session_id_chat_history_list")||"[]").find(p=>p.session_id===a);n?(r.value=n.chatHistory,r.value.length===1&&console.log("请求接口")):(alert("该session_id无历史记录"),h.push("/"))}z(async()=>{u.value=l.sessionId,x(l.sessionId)}),P(()=>l.sessionId,a=>{u.value=a,x(a)}),P(r,async()=>{await E();const a=k.value;if(!a)return;const e=a.wrapRef||a.wrap||null;if(typeof a.setScrollTop=="function"&&e&&e.scrollHeight!=null){try{a.setScrollTop(e.scrollHeight)}catch{e&&typeof e.scrollTop<"u"&&(e.scrollTop=e.scrollHeight)}return}const n=a instanceof Element?a:e;n&&typeof n.scrollTop<"u"&&(n.scrollTop=n.scrollHeight)},{deep:!0});const C=async()=>{if(i.value.trim().length==0)return;const a=i.value.trim();i.value="",o.value=!0,r.value.push({role:"user",text:a});const e=B({role:"model",text:""});setTimeout(()=>{r.value.push(e)},100),u.value||(u.value=g()),await U({session_id:u.value,messages:r.value},{onStart:()=>{console.log("🔵 onStart")},onDelta:n=>{console.log("onDelta",n),e.text+=n},onEnd:n=>{console.log("🏁 完成:",n),o.value=!1},onError:n=>{e.text+=`
[出错了]`,console.error("❌ error:",n),o.value=!1}}),m()};function m(){const a=JSON.parse(localStorage.getItem("session_id_chat_history_list")||"[]"),e=a.findIndex(n=>n.session_id===u.value);e!==-1?(a[e].chatHistory=r.value,localStorage.setItem("session_id_chat_history_list",JSON.stringify(a))):(a.push({session_id:u.value,chatHistory:r.value}),localStorage.setItem("session_id_chat_history_list",JSON.stringify(a)))}function g(){return"msg-"+Date.now()+"-"+Math.floor(Math.random()*1e4)}function A(a,e){const n=`${a}-${e}`;y.value[n]=!y.value[n]}const S=a=>{o.value||(o.value=!0,console.log(`${a.text} 
 ${O[a.query]}`),i.value=`${a.text} 
 ${O[a.query]}`,C())},b=[{query:"microsoft-report",method:"scratch",text:`"Research and write analysis report on Microsoft's latest earnings"`},{query:"meeting-minutes",method:"scratch",text:'"Create meeting minutes from recorded discussion"'},{query:"proposal",method:"scratch",text:'"Write project proposal with timeline, budget, and deliverables"'},{query:"daily-schedule",method:"scratch",text:'"Create a comprehensive and well-organized daily schedule"'}],O={"microsoft-report":`Company: Microsoft Corporation
Fiscal Quarter: Q1 FY2026
Key Focus Areas: Cloud revenue growth, AI services impact, Azure performance, Office 365 adoption
Comparison Period: Q1 FY2025 and Q4 FY2025
Include: Revenue breakdown by segment, year-over-year growth rates, operating margins, strategic initiatives
Tone: Professional financial analysis for investors and stakeholders`,"meeting-minutes":`Meeting: Product Strategy Planning Session
Date: October 22, 2024
Attendees: Sarah Chen (CEO), Mike Johnson (CTO), Lisa Park (CPO), Tom Wilson (CFO)
Duration: 2 hours
Key Decisions:
- Approved $2M budget for AI feature development
- Q1 2025 product roadmap finalized
- New pricing strategy for enterprise tier
Action Items:
- Mike to hire 3 ML engineers by November
- Lisa to conduct user research on proposed features
- Tom to prepare financial projections for board meeting
Follow-up: Weekly sync meetings starting next Monday`,proposal:`Meeting: Product Strategy Planning Session
Date: October 22, 2024
Attendees: Sarah Chen (CEO), Mike Johnson (CTO), Lisa Park (CPO), Tom Wilson (CFO)
Duration: 2 hours
Key Decisions:
- Approved $2M budget for AI feature development
- Q1 2025 product roadmap finalized
- New pricing strategy for enterprise tier
Action Items:
- Mike to hire 3 ML engineers by November
- Lisa to conduct user research on proposed features
- Tom to prepare financial projections for board meeting
Follow-up: Weekly sync meetings starting next Monday. Please read "reports/proposal.md" for more detail informations.`,rewrite:"None",summarize:`Key sections to focus on:
- Strategic objectives and business value proposition
- Budget breakdown by phase and resource allocation
- Critical milestones and timeline dependencies
- Risk mitigation strategies and contingency plans
- ROI projections and success metrics (35% cost reduction, 50% processing improvement)
- Technology stack and infrastructure decisions
- Resource requirements and team composition`,translate:"None","add-toc":"None","architecture-newsletter":`Studio: Skyline Atelier Architects
Main Story: City greenlights North Pier Community Library; groundbreaking set for Oct 28
Sections to Include:
- Library milestone & neighborhood impact
- Market snapshot: office-to-residential conversions in top 5 US metros
- Design trend: mass timber + carbon benefits
- Practical guide: harnessing natural light in buildings
- Team spotlight: Maya Ortega, AIA Chicago Emerging Professionals Award winner
- Events: open studio, ribbon cutting, breakfast talk
Tone: Professional, approachable, client-facing`,"back-to-school-newsletter":`School: Roosevelt Middle School
Issue: September 2025 "Back to School" edition
Principal: Dr. Elena Alvarez
Sections to Include:
- Welcome message with campus updates
- Upcoming events calendar
- Recent school highlights
- Counselors' updates and resources
- Monthly focus: Attendance & Kindness
- Book recommendation
- Inspirational quote
Contact Info: office: 718-555-0145 | ealvarez@rooseveltrms.org | rooseveltrms.org | @RMSRockets
Tone: Friendly, informative, community-oriented`,"basic-menu":`Event: Mia's 30th Candlelight Supper
Vibe: Cozy early-autumn; backyard string lights; 14 guests
Dietary: No peanuts; Jess is vegetarian

Selected Courses:
✓ First bite: Roasted squash + apple soup
  - butternut and Honeycrisp roasted with sage and nutmeg
  - blended with coconut milk; swirl of maple-coconut cream
  - finish with toasted pepitas for crunch

✓ The big plate: Red wine–braised short ribs on parmesan polenta
  - slow 4-hour braise with garlic, thyme, and a strip of orange peel
  - glossy pan sauce over creamy polenta
  - side: charred broccolini with lemon zest
  - veg backup: wild mushroom risotto with herbs (for Jess)

✓ Sweet ending: Brown butter apple crisp + vanilla bean ice cream
  - Granny Smith and Honeycrisp; cinnamon and cardamom
  - oat-almond crumble; warm salted caramel drizzle
  - serve with a scoop of vanilla bean ice cream

Style: Warm, tempting descriptions that match the cozy autumn atmosphere`,"architecture-brochure":`Firm: Harborline Design — Architecture + Interiors
Tagline: Design for coasts and communities
Background: Founded in 2014, minority-owned studio in Boston's Seaport focusing on adaptive reuse and waterfront projects
Key Differentiators:
- 70+ projects in New England
- Licensed in MA, RI, NH; MBE certified
- Energy models on every project; 32% lower EUI than code baseline
- Community-first engagement process
Sections Needed:
- Company background
- Featured projects with images
- Services offered
- Design process
- Team/hiring information
- Awards & recognition
- Contact information
Style: Clean, modern, professional with coastal influence`,"daily-schedule":`Person: Alex Kim
Role: Graduate student and part-time software developer
Date: Monday, October 28, 2025
Schedule Requirements:

Wake up time: 6:30 AM
Work hours: Remote software development (2:00 PM - 6:00 PM)
Class schedule: Two graduate classes (Database Systems 9:00-10:30 AM, Machine Learning 11:00 AM-12:30 PM)
Gym session: 7:00-8:00 AM
Meal times: Breakfast, lunch, dinner with specific time blocks
Study/homework blocks: 2-3 hours distributed throughout the day
Personal time: 1 hour for hobbies/relaxation
Sleep target: 11:00 PM

Additional Elements to Include:

Morning routine (meditation, breakfast prep)
Commute times if applicable
Short breaks between activities
Evening wind-down routine
Important reminders (team meeting at 3 PM, assignment due Wednesday)
Optional buffer time for flexibility

Tone: Practical, motivating, balanced between productivity and self-care
Format: Clean visual layout with time blocks, easy to scan, includes priority markers or notes where helpful`};return(a,e)=>(c(),d("div",Q,[t("div",V,[t("div",Y,[t("div",Z,[e[7]||(e[7]=t("div",{class:"chat-header"},[t("div",{class:"header-left"},[t("h1",{class:"app-title"},"Office CLI")])],-1)),t("div",{class:"chat-messages",id:"chatMessages",ref_key:"scrollbarRef",ref:k},[(c(!0),d(I,null,T(r.value,(n,p)=>(c(),d("div",{key:p,class:"conversation-item"},[n.role==="user"?(c(),d("div",X,[...e[2]||(e[2]=[t("div",{class:"conv-avatar user"},"U",-1),t("span",{class:"conv-role"},"User",-1)])])):w("",!0),n.role==="model"&&p>0&&r.value[p-1].role!="model"?(c(),d("div",ee,[...e[3]||(e[3]=[t("img",{src:W,alt:"Office CLI",style:{width:"32px",height:"32px","border-radius":"50%","object-fit":"cover"}},null,-1),t("span",{class:"conv-role",style:{"font-size":"15px","font-weight":"700",color:"#0078d4"}},"Office CLI for Word",-1)])])):w("",!0),t("div",{class:$(["conv-content",n.role=="user"?"user-content":""])},[n.role==="user"?(c(),d("div",{key:0,textContent:_(n.text),style:{"white-space":"pre-line"}},null,8,te)):(c(),d("div",{key:1,style:{"margin-bottom":"8px","white-space":"pre-line"},textContent:_(n.text)},null,8,ne)),n.data&&n.data.actions&&n.data&&n.data.actions.length>0?(c(!0),d(I,{key:2},T(n.data&&n.data.actions,(v,M)=>(c(),d("div",{key:M,class:"tool-call",style:{opacity:"1"}},[t("div",se,[t("span",oe,_(L(K)(v.icon)),1),t("span",ae,_(v.title),1),t("span",re,_(v.description),1),e[4]||(e[4]=t("span",{class:"tool-chevron"},"›",-1))]),v.previewType==="code"&&v.previewContent?(c(),d("div",ie,[t("div",{class:"action-code-header",onClick:Se=>A(p,M)},[e[5]||(e[5]=t("i",{class:"fas fa-play-circle"},null,-1)),e[6]||(e[6]=t("span",null,"Execute Code",-1)),t("i",{class:$(["fas","collapse-icon",y.value[`${p}-${M}`]?"fa-chevron-down":"fa-chevron-right"])},null,2)],8,le),N(t("div",ce,[t("pre",null,[t("code",{innerHTML:L(G)(v.previewContent)},null,8,de)])],512),[[j,y.value[`${p}-${M}`]]])])):w("",!0)]))),128)):w("",!0)],2)]))),128))],512),t("div",ue,[r.value.length==0?(c(),d("ul",pe,[(c(),d(I,null,T(b,n=>t("li",{key:n.query,"data-query":n.query,onClick:p=>S(n)},[t("span",fe,_(n.text),1)],8,he)),64))])):w("",!0),t("div",me,[N(t("textarea",{"onUpdate:modelValue":e[0]||(e[0]=n=>i.value=n),id:"userInput",class:"chat-input",placeholder:r.value.length==0?"You can choose one of the examples above or enter your own requirements.":"Enter your own requirements",rows:"1",onKeydown:[R(D(C,["exact","prevent"]),["enter"]),e[1]||(e[1]=R(D(()=>{},["shift"]),["enter"]))]},null,40,ge),[[F,i.value]]),t("button",{class:"send-btn",id:"sendBtn",onClick:C,disabled:o.value||i.value.trim().length==0},[o.value?(c(),d("i",_e)):(c(),d("i",ve))],8,ye)])])]),t("div",be,[e[10]||(e[10]=t("div",{class:"preview-header"},[t("div",{class:"preview-title-section"},[t("h2",{class:"preview-title",id:"previewTitle"}," Document Preview "),t("span",{class:"preview-subtitle",id:"previewSubtitle"},"Waiting for generation...")])],-1)),t("div",we,[(c(),d("div",ke,[...e[8]||(e[8]=[t("div",{style:{padding:"10px",background:"#f8f9fa","border-bottom":"1px solid #e0e0e0",display:"flex","justify-content":"space-between","align-items":"center"}},[t("span",{style:{"font-weight":"600",color:"#0078d4"}},"Microsoft Word Document")],-1),t("embed",{src:"http://20.1.170.90:2233/files/test.pdf",type:"",style:{height:"100%"}},null,-1)])]))])])])]),e[11]||(e[11]=t("div",{class:"toast-container",id:"toastContainer"},null,-1))]))}},xe=q(Ce,[["__scopeId","data-v-838cc874"]]);export{xe as C};
