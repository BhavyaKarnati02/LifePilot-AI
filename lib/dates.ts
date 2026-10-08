export const TODAY=new Date().toISOString().slice(0,10)
export function addDays(date:string,n:number){const d=new Date(`${date}T00:00:00`);d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
export function formatDate(date:string){if(!date)return '';return new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(`${date}T00:00:00`))}
