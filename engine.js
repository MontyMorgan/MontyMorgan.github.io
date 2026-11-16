/* Free, deterministic scenario engine. No AI model, fetch, API key or backend. */
(function(root){
 const words=s=>String(s||'').toLowerCase().match(/[a-z0-9]{3,}/g)||[];
 const lines=s=>String(s||'').split(/\n/).map(x=>x.replace(/^[-*\d.)\s]+/,'').trim()).filter(Boolean);
 function pairsFrom(text){const pairs=[];let q='';
  try{const data=JSON.parse(text);const array=Array.isArray(data)?data:data.pairs;if(Array.isArray(array))for(const x of array)if(typeof x.objection==='string'&&typeof x.response==='string')pairs.push({objection:x.objection,response:x.response});}catch{}
  for(const line of lines(text)){
   const split=line.split(/\s*(?:=>|\|)\s*/);if(split.length===2){pairs.push({objection:split[0].replace(/^(?:objection|customer|q):\s*/i,''),response:split[1].replace(/^(?:response|rebuttal|answer|a):\s*/i,'')});continue;}
   if(/^(objection|customer|q):/i.test(line))q=line.replace(/^[^:]+:\s*/,'');
   else if(q&&/^(response|rebuttal|answer|a):/i.test(line)){pairs.push({objection:q,response:line.replace(/^[^:]+:\s*/,'')});q='';}
  }return pairs;
 }
 function playbook(c){const pairs=pairsFrom(c.documents);const o=lines(c.objections),r=lines(c.rebuttals);for(let i=0;i<o.length;i++)pairs.push({objection:o[i],response:r[i]||r[0]||'Acknowledge the concern, ask a question, and use only the supplied product facts.'});return pairs.slice(0,80);}
 function similarity(a,b){const x=new Set(words(a)),y=new Set(words(b));let n=0;for(const w of x)if(y.has(w))n++;return x.size?n/x.size:0;}
 const personalities=['Friendly and interested','Busy and distracted','Skeptical','Price-sensitive','Frustrated and impatient','Already using a competitor','Hard to convince','Nearly ready to hang up','Curious but unqualified','Interested but needing reassurance'];
 function makeCall(config,mode,random=Math.random){const pick=a=>a[Math.floor(random()*a.length)%a.length];return {config,mode,personality:pick(personalities),patience:mode==='training'?8:mode==='test'?3:5,willing:random()>.3,turns:0,stage:'opening',pairs:playbook(config),last:null,handled:0,misses:0,warnings:0,interrupted:0,transcript:[],ended:false};}
 function end(c,outcome,reason,text){c.ended=true;return {text,outcome,reason,end:true};}
 function respond(c,text){if(c.ended)return {text:'This call has ended.',end:true};c.turns++;
  const s=text.toLowerCase();const conf=c.config;
  if(/\b(goodbye|bye|stop calling|do not call|don't call|leave me alone|not interested|no thanks)\b/i.test(s))return end(c,'Not Interested','A clear refusal or goodbye ended the practice call.','Understood. Thank you for your time. Goodbye.');
  if(/\b(guaranteed|guarantee you|no risk|risk.free|100 percent|100%)\b/i.test(s)){c.warnings++;if(c.warnings>1)return end(c,'Hung Up','Repeated absolute promises matched the unsupported-claims rule.','I am not comfortable with those promises. Goodbye.');return {text:'That sounds like a strong promise. What evidence and limitations can you share?'};}
  if(c.interrupted>=(c.mode==='training'?5:3))return end(c,'Hung Up','The Interrupt customer control was used repeatedly.','You keep interrupting me. I am ending this call.');
  if(c.mode==='salesperson'){
   if(/price|cost|expensive|budget/i.test(s))return {text:conf.pricing||'Let us review the approved pricing details together.'};
   const match=c.pairs.map(p=>({p,n:similarity(p.objection,text)})).sort((a,b)=>b.n-a.n)[0];if(match?.n>.2)return {text:match.p.response};
   if(/yes|appointment|meeting|schedule|interested|sounds good/i.test(s))return end(c,'Appointment Set','The customer agreed to a hypothetical next step.','Thank you. Let us agree on a convenient time for a follow-up. This is only a practice appointment.');
   if(c.turns===1)return {text:conf.pitch+' What would you most like to improve in your current situation?'};
   if(c.turns<4)return {text:'What matters most to you when considering '+conf.product+'? '+(c.turns===3?conf.description:'')};
   return end(c,'Completed','The scripted salesperson demonstration reached its closing step.','Based on what we discussed, would a follow-up about '+conf.product+' be useful? Thank you for practicing.');
  }
  if(c.stage==='opening'){
   c.stage='discovery';if(!/hello|hi\b|name|calling|help|\?/.test(s)){c.misses++;return {text:'Who is calling, and what is this about?'};}
   if(/Busy|impatient|hang up/.test(c.personality))return {text:'I only have a moment. What is the reason for your call?'};
   return {text:'What would '+conf.product+' help someone like me with?'};
  }
  if(c.last){const match=similarity(c.last.response,text);const acknowledged=/understand|fair|hear you|makes sense|appreciate|concern|respect/.test(s);if(match>.12||acknowledged&&text.includes('?')){c.handled++;c.last=null;c.stage='closing';return {text:c.willing?'That helps. What would the next step involve?':'I understand, but I am not looking to change right now. Please respect that.'};}
   c.misses++;if(c.misses>=c.patience)return end(c,'Hung Up','Repeated replies did not match the current objection or ask an acknowledging question.','I do not think you are addressing my concern. I need to go. Goodbye.');return {text:'My main concern is still this: '+c.last.objection};
  }
  if(c.stage==='closing'){
   if(!c.willing)return end(c,'Not Interested','This scenario declines even after a useful response.','Thank you, but I will pass. Goodbye.');
   if(/callback|call back|later|another time/i.test(s))return end(c,'Callback Requested','The salesperson proposed a callback and this scenario accepted.','A callback would work. Let us agree on a time in this practice scenario.');
   if(/appointment|meeting|schedule|book|next step|follow.up|demo|consultation|zoom/i.test(s))return end(c,'Appointment Set','The salesperson asked for a concrete simulated next step.','Yes, I would be open to a short meeting. This is a simulated agreement, not a real booking.');
  }
  if(c.turns>= (c.mode==='training'?14:9))return end(c,'Completed','The scenario turn limit was reached.','I have to get back to my day. Thank you for explaining. Goodbye.');
  if(c.stage==='discovery'&&text.includes('?')){c.stage='objection';return {text:'I am interested in '+(/cost|budget|price/.test(s)?'keeping costs predictable.':/time|process|currently/.test(s)?'saving time without adding extra work.':'understanding the value before making a change.')+' How does your offer address that?'};}
  const next=c.pairs[c.handled%c.pairs.length]||{objection:conf.competitors?'I already use another provider. Why change?':'I am not sure this is worth the cost.',response:conf.rebuttals};c.last=next;c.stage='objection';return {text:next.objection};
 }
 function coaching(c){const p=c.last||c.pairs[0];return 'Practice coach (rule-based)\n\nCurrent concern: '+(p?.objection||'Clarify the reason for your call.')+'\n\nSuggested response from your playbook: '+(p?.response||c.config.opening)+'\n\nTry this: acknowledge the concern, ask a short discovery question, then explain only the relevant product facts. Avoid claiming an outcome you cannot support.\n\nYour constraints: '+c.config.rules;}
 function evaluate(c){const turns=c.transcript.filter(x=>x.role==='human');const text=turns.map(x=>x.text).join(' ');const opening=turns[0]?.text||'';const quote=t=>'“'+String(t).slice(0,180)+'”';const found=re=>turns.find(t=>re.test(t.text));
 const metrics=[['Opening',opening?(/hello|hi\b|name|calling/i.test(opening)?80:40):null,opening?quote(opening):'No opening recorded.','Introduce yourself and explain why you are calling.'],['Listening',null,'A keyword-based engine cannot reliably measure listening or vocal behavior.','Summarize what the customer said before responding.'],['Discovery',turns.length?(text.includes('?')?80:30):null,found(/\?/)?quote(found(/\?/).text):'No question mark detected; speech transcription punctuation can affect this check.','Ask about the current situation and priorities.'],['Objection handling',c.handled?80:c.misses?30:null,`${c.handled} playbook-match or acknowledging-question responses; ${c.misses} unmatched responses. This is a lexical check.`, 'Use the supplied rebuttal naturally, rather than repeating the whole pitch.'],['Communication',turns.length?(turns.some(t=>words(t.text).length>100)?45:75):null,turns.length+' salesperson turns checked for excessive length. Clarity and tone are not measured.','Keep each response concise and relevant.'],['Product knowledge',turns.length?(similarity(c.config.description+' '+c.config.pitch,text)>.1?75:40):null,'Checks shared words with your supplied description/pitch; factual accuracy is not verified.','Use accurate product facts and qualify limitations.'],['Closing',turns.length?(found(/appointment|meeting|schedule|callback|call back|next step|follow.up/i)?85:35):null,found(/appointment|meeting|schedule|callback|call back|next step|follow.up/i)?quote(found(/appointment|meeting|schedule|callback|call back|next step|follow.up/i).text):'No closing phrase detected.','Ask for a specific next step when appropriate.'],['Professionalism',turns.length?Math.max(0,85-c.warnings*25-c.interrupted*10):null,`${c.warnings} absolute-claim flags; ${c.interrupted} manual interruption events. Other compliance rules require human review.`,'Respect refusals and avoid unsupported promises.']];
 if(c.mode==='salesperson')return {summary:'Scripted salesperson demonstration finished. No score is assigned to you as the customer.',scores:[],nextSteps:['Review whether the demonstration used your approved script accurately.','Practice the salesperson role in Training mode.']};
 return {summary:'Basic rule-based practice feedback. These scores are not an AI judgment or a validated assessment. Ending: '+(c.reason||'Call completed.'),scores:metrics.map(([category,score,evidence,improvement])=>({category,score,evidence,improvement})),nextSteps:['Review the transcript and score evidence yourself.','Retry one objection using a shorter, more relevant response.']};
 }
 root.FreeCallEngine={makeCall,respond,coaching,evaluate,playbook,pairsFrom,personalities};
})(typeof module==='object'?module.exports:window);
