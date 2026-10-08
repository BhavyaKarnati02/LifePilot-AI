export type Task={id:string;title:string;due:string;duration:string;done:boolean;adjusted?:boolean;purpose?:string;steps?:string[];result?:string}
export type Goal={id:string;title:string;description:string;deadline:string;category:string;outcomes:string[];milestones:string[];tasks:Task[]}
export type ChatMessage={id:string;role:'user'|'assistant';content:string;time:string}
export type ActivityKind='completed'|'replanned'|'created'|'missed'
export type Activity={id:string;kind:ActivityKind;title:string;detail:string;time:string}
export type MemoryCategory='preferences'|'context'
export type MemoryItem={id:string;category:MemoryCategory;label:string;value:string;source:string}
