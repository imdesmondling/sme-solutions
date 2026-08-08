"use client";

import { FormEvent, useEffect, useState } from "react";

type View="login"|"signup"|"verified"|"forgot"|"reset"|"sme"|"student";
type Props={view:View;go:(view:View)=>void;enter:(role:"sme"|"student")=>void};
const url=process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/,"");
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

async function request(path:string,body:Record<string,unknown>,token?:string){
 if(!url||!key)throw new Error("Supabase is not configured.");
 const response=await fetch(`${url}/auth/v1/${path}`,{method:path==="user"?"PUT":"POST",headers:{apikey:key,"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body)});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.msg||data.message||data.error_description||"Authentication failed.");
 return data;
}

export function RealAuth({view,go,enter}:Props){
 const [kind,setKind]=useState<"sme"|"student">("sme");
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(""),[failed,setFailed]=useState(false);
 useEffect(()=>{const hash=new URLSearchParams(location.hash.slice(1));const token=hash.get("access_token"),type=hash.get("type");if(token){sessionStorage.setItem("sme-access-token",token);history.replaceState(null,"",location.pathname);go(type==="recovery"?"reset":"verified")}},[go]);
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setMessage("");setFailed(false);const form=new FormData(event.currentTarget),email=String(form.get("email")||""),password=String(form.get("password")||""),userId=String(form.get("user_id")||"");try{
  if(view==="signup"){await request(`signup?redirect_to=${encodeURIComponent(location.origin)}`,{email,password,data:{user_id:userId,display_name:userId,account_type:kind==="sme"?"sme_owner":"student"}});setMessage(`Verification email sent to ${email}. Check your inbox.`)}
  else if(view==="forgot"){await request(`recover?redirect_to=${encodeURIComponent(location.origin)}`,{email});setMessage(`Password reset email sent to ${email}.`)}
  else if(view==="reset"){const token=sessionStorage.getItem("sme-access-token");if(!token)throw new Error("Open the reset link from your email first.");await request("user",{password},token);sessionStorage.removeItem("sme-access-token");setMessage("Password updated. Return to login.")}
  else{const data=await request("token?grant_type=password",{email,password});sessionStorage.setItem("sme-access-token",data.access_token);sessionStorage.setItem("sme-user-id",data.user.id);enter(data.user?.user_metadata?.account_type==="student"?"student":"sme")}
 }catch(error){setFailed(true);setMessage(error instanceof Error?error.message:"Authentication failed.")}finally{setBusy(false)}}
 const copy=view==="signup"?["Create your account","Join a community turning real challenges into practical learning."]:view==="forgot"?["Forgot your password?","We’ll send a secure reset link to your inbox."]:view==="reset"?["Choose a new password","Use at least eight characters."]:view==="verified"?["Email verified","Your account is enabled and ready."]:["Make progress, together.","A focused space for SMEs and students to solve meaningful business challenges."];
 return <main className="auth"><section className="auth-story"><div className="brand light"><span>SP</span><b>SME Projects</b></div><p className="eyebrow">Singapore’s applied learning network</p><h1>{copy[0]}</h1><p>{copy[1]}</p><div className="story-card"><b>Real briefs. Fresh thinking.</b><span>One shared workspace from first idea to chosen proposal.</span></div></section><section className="auth-form"><div className="panel">{view==="verified"?<><div className="verified">✓</div><h2>Email verified</h2><p>Your account is ready.</p><button className="primary" onClick={()=>go("login")}>Continue to login</button></>:<><p className="eyebrow">Welcome</p><h2>{copy[0]}</h2><form onSubmit={submit}>{view==="signup"&&<><label>User ID<input name="user_id" required minLength={3} maxLength={50}/></label><label>Account type<select value={kind} onChange={e=>setKind(e.target.value as typeof kind)}><option value="sme">SME Owner</option><option value="student">Student</option></select></label></>}{view==="login"&&<div className="role"><button type="button" className={kind==="sme"?"active":""} onClick={()=>setKind("sme")}>SME Owner</button><button type="button" className={kind==="student"?"active":""} onClick={()=>setKind("student")}>Student</button></div>}{view!=="reset"&&<label>Email address<input name="email" required type="email"/></label>}{view!=="forgot"&&<label>{view==="reset"?"New password":"Password"}<input name="password" required type="password" minLength={8}/></label>}<button className="primary" disabled={busy}>{busy?"Please wait…":view==="signup"?"Create account":view==="forgot"?"Send reset link":view==="reset"?"Reset password":"Sign in"}</button></form>{message&&<p role="status" style={{color:failed?"#b42318":"#18794e",lineHeight:1.5}}>{message}</p>}<div className="auth-links">{view==="login"?<><button onClick={()=>go("forgot")}>Forgot password?</button><span>New here? <button onClick={()=>go("signup")}>Create an account</button></span></>:<button onClick={()=>go("login")}>Back to login</button>}</div></>}</div></section></main>;
}
