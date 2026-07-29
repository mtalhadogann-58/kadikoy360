import {NextRequest,NextResponse} from "next/server";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 try{
  if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:"OPENAI_API_KEY tanımlı değil."},{status:503});
  const {image}=await req.json();
  if(typeof image!=="string"||!image.startsWith("data:image/"))return NextResponse.json({error:"Geçerli fotoğraf gerekli."},{status:400});
  const r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({
   model:"gpt-4.1-mini",temperature:0,response_format:{type:"json_object"},messages:[
    {role:"system",content:"Türkiye seçim sonuç tutanağından veri çıkar. Yalnızca fotoğrafta açıkça görülen değerleri yaz. Asla tahmin etme veya sayı uydurma. Okunmayan metin boş string, okunmayan sayı null olsun. Yalnız JSON döndür."},
    {role:"user",content:[{type:"text",text:'Şu JSON yapısıyla oku: {"school":"","ballotBox":"","district":"","neighborhood":"","registeredVoters":null,"voters":null,"validVotes":null,"invalidVotes":null,"parties":[{"name":"","votes":null}],"confidence":0,"warnings":[]}. Parti/aday satırlarını görüldüğü sırayla ekle. confidence 0-100.'},{type:"image_url",image_url:{url:image,detail:"high"}}]}
   ]})});
  const p=await r.json();
  if(!r.ok)return NextResponse.json({error:p?.error?.message||"OCR servisi yanıt vermedi."},{status:r.status});
  const text=p?.choices?.[0]?.message?.content;
  if(!text)return NextResponse.json({error:"Fotoğraftan veri okunamadı."},{status:422});
  return NextResponse.json(JSON.parse(text));
 }catch{return NextResponse.json({error:"Tutanak işlenirken hata oluştu."},{status:500})}
}
