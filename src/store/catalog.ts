import type { Locale } from '../i18n';
export type Category = 'watches'|'fashion'|'collectibles'|'technology'|'celestial';
export type Localized = Record<Locale,string>;
export type Product = {
  id:string; name:Localized; subtitle:Localized; description:Localized; material:Localized;
  category:Category; price:number; stock:number; image:string; featured?:boolean; bestseller?:boolean; discount?:number; badge?:Localized;
};
export const products:Product[] = [
 {id:'watch',name:{en:'Heritage Automatic',ru:'Heritage Automatic',nb:'Heritage Automatic'},category:'watches',price:12500,stock:2,image:'/products/watch.webp',featured:true,
 subtitle:{en:'Time, beautifully considered.',ru:'Время, продуманное в деталях.',nb:'Tid, vakkert gjennomtenkt.'},
 description:{en:'A quiet statement in steel and leather. An automatic watch for people who believe the best moments deserve their own pace. A fictional design concept, without a real manufacturer.',ru:'Сдержанный характер стали и кожи. Автоматические часы для тех, кто ценит собственный ритм. Вымышленная дизайнерская модель без реального производителя.',nb:'Et dempet uttrykk i stål og skinn. En automatisk klokke for dem som setter pris på sitt eget tempo. Et fiktivt designkonsept uten en virkelig produsent.'},
 material:{en:'Steel · leather · imaginary precision',ru:'Сталь · кожа · воображаемая точность',nb:'Stål · skinn · tenkt presisjon'}},
 {id:'sock',name:{en:'The Lonely Sock',ru:'Одинокий носок',nb:'Den ensomme sokken'},category:'fashion',price:499,stock:18,image:'/products/sock.webp',discount:20,
 subtitle:{en:'Perfectly complete. On its own.',ru:'Самодостаточен. Без пары.',nb:'Helt komplett. Helt alene.'},
 description:{en:'One exceptionally ordinary sock. Its partner left to find itself, so we gave this one a new purpose: proving that presentation can make anything extraordinary.',ru:'Один исключительно обычный носок. Его пара отправилась искать себя. А он остался доказывать, что правильная подача способна сделать необычным что угодно.',nb:'Én usedvanlig vanlig sokk. Partneren dro for å finne seg selv. Denne ble igjen for å vise at god presentasjon kan gjøre hva som helst ekstraordinært.'},
 material:{en:'Cotton · independence · one piece',ru:'Хлопок · независимость · 1 штука',nb:'Bomull · selvstendighet · ett eksemplar'}},
 {id:'duck',name:{en:'Executive Duck',ru:'Утка-директор',nb:'Direktøranden'},category:'collectibles',price:2999,stock:24,image:'/products/duck.webp',bestseller:true,
 subtitle:{en:'A very different kind of board member.',ru:'Важные решения. Ни одного слова.',nb:'Et litt annerledes styremedlem.'},
 description:{en:'A small duck with a big presence. Calm under pressure, excellent at listening, and available for meetings that could have been an email. Bestseller is a demonstration label.',ru:'Маленькая утка с большим авторитетом. Спокойна под давлением, прекрасно слушает и готова к совещаниям, которые можно было заменить письмом. «Бестселлер» — демонстрационная метка.',nb:'En liten and med stor tilstedeværelse. Rolig under press, god til å lytte og klar for møter som kunne vært en e-post. «Bestselger» er en demonstrasjonsetikett.'},
 material:{en:'Matte rubber · executive confidence',ru:'Матовая резина · уверенность руководителя',nb:'Matt gummi · lederens selvtillit'}},
 {id:'phone',name:{en:'Pocket Universe',ru:'Карманная вселенная',nb:'Et univers i lommen'},category:'technology',price:8990,stock:0,image:'/products/phone.webp',
 subtitle:{en:'Everything. Almost everywhere.',ru:'Всё. Почти везде.',nb:'Alt. Nesten overalt.'},
 description:{en:'An imagined smartphone with a restrained graphite silhouette. A pocket-sized portal to big ideas — and the occasional unnecessary notification. No real specifications or brand are implied.',ru:'Вымышленный смартфон в сдержанном графитовом корпусе. Карманный портал к большим идеям — и иногда к совершенно ненужным уведомлениям. Реальная марка и характеристики не подразумеваются.',nb:'En tenkt smarttelefon med en diskret grafittfarget silhuett. En liten portal til store ideer — og en og annen unødvendig varsling. Ingen virkelig merkevare eller spesifikasjoner er ment.'},
 material:{en:'Graphite concept · glass · possibility',ru:'Графитовый концепт · стекло · возможности',nb:'Grafittkonsept · glass · muligheter'}},
 {id:'moon',name:{en:'The Moon',ru:'Луна',nb:'Månen'},category:'celestial',price:999999999,stock:1337,image:'/products/moon.webp',featured:true,
 subtitle:{en:'For the person who has everything. Almost.',ru:'Для тех, у кого уже всё. Почти.',nb:'For den som har alt. Nesten.'},
 description:{en:'The original night light. Familiar craters, an exceptional silhouette, and an inventory of 1,337 Moons that may require a second look. A deliberately impossible product. No ownership, delivery or lunar rights are offered.',ru:'Самый первый ночник. Знакомые кратеры, безупречный силуэт и запас из 1337 Лун, который стоит перепроверить. Намеренно невозможный товар: права на Луну, доставка и владение не предлагаются.',nb:'Det opprinnelige nattlyset. Velkjente kratere, en enestående silhuett og et lager på 1337 måner som kanskje bør telles på nytt. Et bevisst umulig produkt. Ingen eiendomsrett, levering eller månerettigheter tilbys.'},
 material:{en:'Moon rock · stardust · poetic licence',ru:'Лунная порода · звёздная пыль · воображение',nb:'Månestein · stjernestøv · kunstnerisk frihet'}},
 {id:'banana',name:{en:'Banana Royale',ru:'Королевский банан',nb:'Banana Royale'},category:'collectibles',price:79999,stock:1,image:'/products/banana.webp',
 subtitle:{en:'Not part of your five a day.',ru:'Не входит в дневную норму фруктов.',nb:'Teller ikke som én av fem om dagen.'},
 description:{en:'A familiar curve, elevated to an entirely unreasonable price. A golden sculpture with no nutritional value and a remarkable ability to start a conversation.',ru:'Знакомый изгиб по совершенно необъяснимой цене. Золотая скульптура без пищевой ценности, зато с исключительной способностью начинать разговор.',nb:'En velkjent kurve til en helt urimelig pris. En gyllen skulptur uten næringsverdi, men med en bemerkelsesverdig evne til å starte en samtale.'},
 material:{en:'Gold-toned sculpture · zero potassium',ru:'Скульптура под золото · 0 калия',nb:'Gullfarget skulptur · null kalium'}}
];
export const categories:Category[]=['watches','fashion','collectibles','technology','celestial'];
export type InventoryState='available'|'low'|'last'|'out';
export function inventoryState(stock:number):InventoryState {
  if(!Number.isFinite(stock)||stock<=0)return 'out';
  if(stock===1)return 'last';
  if(stock===2)return 'low';
  return 'available';
}
export function effectivePrice(product:Pick<Product,'price'|'discount'>) {
  const discount=Math.min(100,Math.max(0,product.discount??0));
  return Math.round(product.price*(1-discount/100)*100)/100;
}
export function formatPrice(value:number,locale:Locale) {
  return new Intl.NumberFormat({en:'en-GB',ru:'ru-RU',nb:'nb-NO'}[locale],{style:'currency',currency:'NOK',currencyDisplay:'code',minimumFractionDigits:Number.isInteger(value)?0:2,maximumFractionDigits:2}).format(value);
}

