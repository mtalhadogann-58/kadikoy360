import {NextRequest,NextResponse} from "next/server";

export const runtime="nodejs";

const knowledge=`
KAYNAK ÖNCELİĞİ:
1. Kullanıcının sağladığı "SECIM2024", "Sıkça Sorulan Sorular 2024 - 31 Mart 2024" ve "SecimGuvenligiEgitimi_v3" içerikleri kesin iç kaynaklardır.
2. YSK mevzuatı ve kararları.
3. Emin olunmayan durumda kesin hüküm verme; okul/mahalle sorumlusunu ilçe seçim güvenliği merkezi veya avukata yönlendir.

OPERASYON KURALLARI:
- Oy verme Türkiye genelinde 08.00'de başlar ve 17.00'de biter. Saat 17.00 geldiğinde sırada bekleyen seçmenler tespit edilip oy kullandırılır; sayım bundan sonra başlar.
- Sandık kuruluna yapılan başvuru "şikâyet", sandık kurulu kararına karşı ilçe seçim kuruluna başvuru "itiraz"dır.
- Şikâyet, sandık sonuç tutanağı düzenlenip imzalanana kadar yapılmalıdır. Ret kararı karar/tutanak defterine işletilmeli ve imzalı örneği alınmalıdır.
- Müşahitler şikâyet etmeye yetkilidir. Ret halinde ilçe seçim kurulu başvurusu için ilçe seçim güvenliği merkezi ve avukatla temasa geçilir.
- Sonuç tutanağının talep eden siyasi parti müşahidine/üyesine verilen nüshası ayrıca imzalı ve mühürlü olmalıdır; bir nüsha kapıya asılır.
- Oy pusulasının geçerliliği tek bir fotoğrafa bakılarak her zaman kesinleştirilemez. Sandık kurulu mührü, YSK filigranı, tercih/evet mührünün konumu, yırtık veya özel işaret ve zarf içeriği birlikte değerlendirilir.
- Birleşik pusulanın katlanması nedeniyle mühür izinin başka bölüme geçmesi tek başına geçersizlik nedeni değildir.
- Tercih/EVET mührü birden fazla parti/aday alanına taşıyorsa veya hiçbir alana basılmamışsa pusula geçersiz olabilir. Tereddütte itiraz kaydı ve kurul kararı gerekir.
- Bir zarftan aynı seçim türüne ait birden fazla pusula çıkarsa o seçim türüne ait pusulalar hesaba katılmaz; diğer seçim türleri kendiliğinden geçersiz olmaz.
- Akşam belirli bir saatte herkesin otomatik olarak ilçe seçim kuruluna gitmesi gerekmez. Görev, yetkilendirme, teslim/itiraz ihtiyacı ve ilçe merkezi talimatına göre hareket edilir.

YANIT BİÇİMİ:
- Önce tek cümlelik net cevap.
- Sonra "Şimdi ne yapmalısınız?" başlığıyla en fazla 4 maddelik eylem listesi.
- Gerekirse "Dayanak" satırında kaynak adını veya 298 sayılı Kanun maddesini belirt.
- Fotoğrafta okunmayan şeyi uydurma. Görsel yetersizse hangi açı/detayın gerektiğini söyle.
- Kullanıcıya siyasi propaganda yapma; yalnız seçim operasyonu ve mevzuat yönlendirmesi ver.
`;

export async function POST(req:NextRequest){
 try{
  if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:"Danışman için OPENAI_API_KEY tanımlı değil."},{status:503});
  const {question,image,role,scope}=await req.json();
  if(typeof question!=="string"||!question.trim())return NextResponse.json({error:"Bir soru yazın."},{status:400});
  const content:any[]=[{type:"text",text:`Aktif kullanıcı: ${role||"bilinmiyor"}; kapsam: ${scope||"bilinmiyor"}.\nSoru: ${question.trim()}`}];
  if(typeof image==="string"&&image.startsWith("data:image/"))content.push({type:"image_url",image_url:{url:image,detail:"high"}});
  const response=await fetch("https://api.openai.com/v1/chat/completions",{
   method:"POST",
   headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},
   body:JSON.stringify({
    model:"gpt-4.1-mini",
    temperature:0.1,
    messages:[
     {role:"system",content:`Sen İYİ Parti Kadıköy seçim operasyonu için ihtiyatlı bir saha rehberisin. Hukuki karar mercii değilsin.\n${knowledge}`},
     {role:"user",content}
    ]
   })
  });
  const payload=await response.json();
  if(!response.ok)return NextResponse.json({error:payload?.error?.message||"Danışman servisi yanıt vermedi."},{status:response.status});
  const answer=payload?.choices?.[0]?.message?.content;
  if(!answer)return NextResponse.json({error:"Yanıt üretilemedi."},{status:422});
  return NextResponse.json({answer});
 }catch{
  return NextResponse.json({error:"Danışmana bağlanırken hata oluştu."},{status:500});
 }
}
