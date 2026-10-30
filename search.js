/* Local, deterministic search; no client query leaves the browser. */
function normalizeQuery(value) {
  return value.toLocaleLowerCase('uk').normalize('NFC').replace(/[’ʼ`]/g,"'").replace(/[^\p{L}\p{N}'\s]/gu,' ').replace(/\s+/g,' ').trim();
}
const queryStopWords = new Set('клієнт клієнтка каже говорить відчуває відчуваю може я мені мене мій моя моє мої ми нас нам ви він вона вони це цей ця ці що щоб як чи і й та а але у в з із зі на до по за про для не так вже ще дуже постійно хочу можу коли після перед під час все всі бути бо від'.split(' '));
function queryWords(text) {return normalizeQuery(text).split(' ').filter(w=>w.length>1&&!queryStopWords.has(w));}
function searchStem(word) {
  if(word.length<6)return word;
  return word.replace(/(еннями|аннями|енням|анням|ення|ання|ями|ами|ого|ому|ими|ість|ати|ити|ової|ою|ий|ій|ів|ах|ях|ам|ям|ти|ла|ли|ло|и|а|у|і|е|ї|ю)$/u,'');
}
function requestSearchScore(doc, query, metadata) {
  const q=normalizeQuery(query); if(!q)return 1;
  const phrases=metadata.requests.map(normalizeQuery),title=normalizeQuery(doc.title),full=normalizeQuery(doc.search);
  if(phrases.includes(q))return 1000;
  if(phrases.some(p=>p.includes(q)))return 800;
  if(title.includes(q))return 600;
  if(full.includes(q))return 400;
  const words=queryWords(q);if(!words.length)return 0;
  const stems=[...new Set(words.map(searchStem))];
  function coverage(text){const tokens=new Set(queryWords(text).map(searchStem));return stems.filter(w=>tokens.has(w)).length/stems.length;}
  const requestMatch=Math.max(...phrases.map(coverage)),titleMatch=coverage(title),bodyMatch=coverage(full);
  // Require most meaningful words; never turn a single generic word into a sentence match.
  const threshold=stems.length===1?1:0.75;
  if(requestMatch>=threshold)return 200+requestMatch*100;
  if(titleMatch>=threshold)return 100+titleMatch*80;
  if(stems.length>=2&&bodyMatch===1)return 50;
  return 0;
}
