window.gpages_config_fallback={"v":1,"zoom":{"enabled":0},"fb":{"enabled":0,"pixel":"","event":"Empty","event_custom":"","event_access":"PageView","event_access_custom":"","event_value":"0","event_currency":""},"ga":{"enabled":0,"id":""},"gtm":{"enabled":0,"id":"GTM-55ZVC8K"},"lgpd":{"enabled":1,"type":2,"color":"ffffff","text":"Usamos cookies para personalizar conteúdos e melhorar a sua experiência.","policy_url":""},"meta":{"title":"Missão Meu Brigadeiro no Ponto Perfeito","description":"","keywords":"","robots":"all","og_title":"Missão Meu Brigadeiro no Ponto Perfeito","og_description":"MBP","og_site_name":"Docis"},"scripts_hash":"fd11934c3bd09eec"};
window.gpages_scripts_fallback={"h":"fd11934c3bd09eec","funcionamento":[function(){
if(!window.getCrawler()){

  window.pixelId = "68851933fad7817eb1bef3c3";
  var a = document.createElement("script");
  a.setAttribute("async", "");
  a.setAttribute("defer", "");
  a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
  document.head.appendChild(a);

}
}]};
var gpages_live=(window.gpages_config&&window.gpages_config.v===1)?window.gpages_config:null;
var gpages_cfg=gpages_live||window.gpages_config_fallback||{};
function gpages_registro(h){var a=window.gpages_scripts,b=window.gpages_scripts_fallback;if(h){if(a&&a.h===h)return a;if(b&&b.h===h)return b;}return {};}
var gpages_scripts_ativos=gpages_live?gpages_registro(gpages_live.scripts_hash):(window.gpages_scripts_fallback||{});
function gpages_zoom_livre(){var z=gpages_cfg.zoom;return !!(z&&z.enabled);}
function gpages_viewport_padrao(){return gpages_zoom_livre()?'width=device-width, initial-scale=1':'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, shrink-to-fit=no';}
function gpages_viewport_zoom(t,p){return gpages_zoom_livre()?('width='+t+', initial-scale=1, maximum-scale='+(p/100)+', minimum-scale='+(p/100)):('width='+t+', initial-scale='+(p/100)+', maximum-scale='+(p/100)+', minimum-scale='+(p/100)+', user-scalable=no, shrink-to-fit=no');}
function gpages_lgpd_texto(l){
var b=String(l.text==null?'':l.text);
return b.split('\n').join('<br>').split('\t').join('<br>').split('\r').join('<br>');
}
function gpages_lgpd_instalar(classe,dominio){
var l=gpages_cfg.lgpd||{};
if(!l.enabled)return;
var tipo=Number(l.type);
if(tipo!==1&&tipo!==2)return;
var barra={'cor':String(l.color==null?'':l.color),'classe':classe,'texto':gpages_lgpd_texto(l),'politica':String(l.policy_url==null?'':l.policy_url),'tipo':tipo};
var opcoes=[{'id':'o'}];
var conf;
if(tipo===2){
barra['fechar']=true;
opcoes.push({'id':'e','valor':true,'codigos':function(){return scripts_estatisticas;}});
opcoes.push({'id':'m','valor':true,'codigos':function(){return scripts_marketing;}});
}else{
barra['fechar']=false;
barra['editar_consentimento']=false;
}
conf={'barra':barra,'opcoes':opcoes,'dominio':dominio,'editado':(GModalApproval.preferencias()?true:false)};
GModalApproval.instalar(conf);
}
 
 
 (function(){'use strict';var e={"class":"className",contenteditable:"contentEditable","for":"htmlFor",readonly:"readOnly",maxlength:"maxLength",tabindex:"tabIndex",colspan:"colSpan",rowspan:"rowSpan",usemap:"useMap"};function aa(a,b){try{return a(b)}catch(c){return b}}var k=document,m=window,ba=k.documentElement,n=k.createElement.bind(k),ca=n("div"),p=n("table"),da=n("tbody"),ea=n("tr"),q=Array.isArray,r=Array.prototype,fa=r.concat,t=r.filter,ha=r.indexOf,ia=r.map,ja=r.push,ka=r.slice,u=r.some,la=r.splice,ma=/^#(?:[\w-]|\\.|[^\x00-\xa0])*$/,na=/^\.(?:[\w-]|\\.|[^\x00-\xa0])*$/,oa=/<.+>/,pa=/^\w+$/;function v(a,b){return a&&(w(b)||x(b))?na.test(a)?b.getElementsByClassName(a.slice(1)):pa.test(a)?b.getElementsByTagName(a):b.querySelectorAll(a):[]}var B=function(){function a(a,c){if(a){if(a instanceof B)return a;var b=a;if(C(a)){if(b=(c instanceof B?c[0]:c)||k,b=ma.test(a)?b.getElementById(a.slice(1)):oa.test(a)?qa(a):v(a,b),!b)return}else if(D(a))return this.ready(a);if(b.nodeType||b===m)b=[b];this.length=b.length;a=0;for(c=this.length;a<c;a++)this[a]=b[a]}}a.prototype.init=function(b,c){return new a(b,c)};return a}(),E=B.prototype,F=E.init;F.fn=F.prototype=E;E.length=0;E.splice=la;"function"===typeof Symbol&&(E[Symbol.iterator]=r[Symbol.iterator]);E.map=function(a){return F(fa.apply([],ia.call(this,function(b,c){return a.call(b,c,b)})))};E.slice=function(a,b){return F(ka.call(this,a,b))};var ra=/-([a-z])/g;function G(a){return a.replace(ra,function(a,c){return c.toUpperCase()})}F.guid=1;function sa(a,b){var c=a&&(a.matches||a.webkitMatchesSelector||a.msMatchesSelector);return!!c&&!!b&&c.call(a,b)}function H(a){return!!a&&a===a.window}function w(a){return!!a&&9===a.nodeType}function x(a){return!!a&&1===a.nodeType}function D(a){return"function"===typeof a}function C(a){return"string"===typeof a}function ta(a){return!isNaN(parseFloat(a))&&isFinite(a)}function I(a){if("object"!==typeof a||null===a)return!1;a=Object.getPrototypeOf(a);return null===a||a===Object.prototype}F.isWindow=H;F.isFunction=D;F.isArray=q;F.isNumeric=ta;F.isPlainObject=I;E.get=function(a){if(void 0===a)return ka.call(this);a=Number(a);return this[0>a?a+this.length:a]};E.eq=function(a){return F(this.get(a))};E.first=function(){return this.eq(0)};E.last=function(){return this.eq(-1)};function J(a,b,c){if(c)for(c=a.length;c--&&!1!==b.call(a[c],c,a[c]););else if(I(a)){var d=Object.keys(a);c=0;for(var h=d.length;c<h;c++){var f=d[c];if(!1===b.call(a[f],f,a[f]))break}}else for(c=0,h=a.length;c<h&&!1!==b.call(a[c],c,a[c]);c++);return a}F.each=J;E.each=function(a){return J(this,a)};E.prop=function(a,b){if(a){if(C(a))return a=e[a]||a,2>arguments.length?this[0]&&this[0][a]:this.each(function(c,h){h[a]=b});for(var c in a)this.prop(c,a[c]);return this}};E.removeProp=function(a){return this.each(function(b,c){delete c[e[a]||a]})};function K(){for(var a=[],b=0;b<arguments.length;b++)a[b]=arguments[b];b="boolean"===typeof a[0]?a.shift():!1;var c=a.shift(),d=a.length;if(!c)return{};if(!d)return K(b,F,c);for(var h=0;h<d;h++){var f=a[h],g;for(g in f)b&&(q(f[g])||I(f[g]))?(c[g]&&c[g].constructor===f[g].constructor||(c[g]=new f[g].constructor),K(b,c[g],f[g])):c[g]=f[g]}return c}F.extend=K;E.extend=function(a){return K(E,a)};function L(a){return C(a)?function(b,c){return sa(c,a)}:D(a)?a:a instanceof B?function(b,c){return a.is(c)}:a?function(b,c){return c===a}:function(){return!1}}E.filter=function(a){var b=L(a);return F(t.call(this,function(a,d){return b.call(a,d,a)}))};function M(a,b){return b?a.filter(b):a}var ua=/\S+/g;function N(a){return C(a)?a.match(ua)||[]:[]}E.hasClass=function(a){return!!a&&u.call(this,function(b){return x(b)&&b.classList.contains(a)})};E.removeAttr=function(a){var b=N(a);return this.each(function(a,d){x(d)&&J(b,function(a,b){d.removeAttribute(b)})})};E.attr=function(a,b){if(a){if(C(a)){if(2>arguments.length){if(!this[0]||!x(this[0]))return;var c=this[0].getAttribute(a);return null===c?void 0:c}return void 0===b?this:null===b?this.removeAttr(a):this.each(function(c,h){x(h)&&h.setAttribute(a,b)})}for(c in a)this.attr(c,a[c]);return this}};E.toggleClass=function(a,b){var c=N(a),d=void 0!==b;return this.each(function(a,f){x(f)&&J(c,function(a,c){d?b?f.classList.add(c):f.classList.remove(c):f.classList.toggle(c)})})};E.addClass=function(a){return this.toggleClass(a,!0)};E.removeClass=function(a){return arguments.length?this.toggleClass(a,!1):this.attr("class","")};function O(a,b,c,d){for(var h=[],f=D(b),g=d&&L(d),y=0,z=a.length;y<z;y++)if(f){var l=b(a[y]);l.length&&ja.apply(h,l)}else for(l=a[y][b];!(null==l||d&&g(-1,l));)h.push(l),l=c?l[b]:null;return h}function P(a){return 1<a.length?t.call(a,function(a,c,d){return ha.call(d,a)===c}):a}F.unique=P;E.add=function(a,b){return F(P(this.get().concat(F(a,b).get())))};function Q(a,b,c){if(x(a)){var d=m.getComputedStyle(a,null);return c?d.getPropertyValue(b)||void 0:d[b]||a.style[b]}}function R(a,b){return parseInt(Q(a,b),10)||0}var S=/^--/,T={},va=ca.style,wa=["webkit","moz","ms"];function xa(a,b){void 0===b&&(b=S.test(a));if(b)return a;if(!T[a]){b=G(a);var c=""+b[0].toUpperCase()+b.slice(1);b=(b+" "+wa.join(c+" ")+c).split(" ");J(b,function(b,c){if(c in va)return T[a]=c,!1})}return T[a]}var ya={animationIterationCount:!0,columnCount:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,gridArea:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnStart:!0,gridRow:!0,gridRowEnd:!0,gridRowStart:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0};function za(a,b,c){void 0===c&&(c=S.test(a));return c||ya[a]||!ta(b)?b:b+"px"}E.css=function(a,b){if(C(a)){var c=S.test(a);a=xa(a,c);if(2>arguments.length)return this[0]&&Q(this[0],a,c);if(!a)return this;b=za(a,b,c);return this.each(function(d,f){x(f)&&(c?f.style.setProperty(a,b):f.style[a]=b)})}for(var d in a)this.css(d,a[d]);return this};var Aa=/^\s+|\s+$/;function Ba(a,b){a=a.dataset[b]||a.dataset[G(b)];return Aa.test(a)?a:aa(JSON.parse,a)}E.data=function(a,b){if(!a){if(!this[0])return;var c={},d;for(d in this[0].dataset)c[d]=Ba(this[0],d);return c}if(C(a))return 2>arguments.length?this[0]&&Ba(this[0],a):void 0===b?this:this.each(function(c,d){c=b;c=aa(JSON.stringify,c);d.dataset[G(a)]=c});for(d in a)this.data(d,a[d]);return this};function Ca(a,b){var c=a.documentElement;return Math.max(a.body["scroll"+b],c["scroll"+b],a.body["offset"+b],c["offset"+b],c["client"+b])}function Da(a,b){return R(a,"border"+(b?"Left":"Top")+"Width")+R(a,"padding"+(b?"Left":"Top"))+R(a,"padding"+(b?"Right":"Bottom"))+R(a,"border"+(b?"Right":"Bottom")+"Width")}J([!0,!1],function(a,b){J(["Width","Height"],function(a,d){E[(b?"outer":"inner")+d]=function(c){if(this[0])return H(this[0])?b?this[0]["inner"+d]:this[0].document.documentElement["client"+d]:w(this[0])?Ca(this[0],d):this[0][(b?"offset":"client")+d]+(c&&b?R(this[0],"margin"+(a?"Top":"Left"))+R(this[0],"margin"+(a?"Bottom":"Right")):0)}})});J(["Width","Height"],function(a,b){var c=b.toLowerCase();E[c]=function(d){if(!this[0])return void 0===d?void 0:this;if(!arguments.length)return H(this[0])?this[0].document.documentElement["client"+b]:w(this[0])?Ca(this[0],b):this[0].getBoundingClientRect()[c]-Da(this[0],!a);var h=parseInt(d,10);return this.each(function(b,d){x(d)&&(b=Q(d,"boxSizing"),d.style[c]=za(c,h+("border-box"===b?Da(d,!a):0)))})}});var U={};E.toggle=function(a){return this.each(function(b,c){if(x(c))if(void 0===a?"none"===Q(c,"display"):a){if(c.style.display=c.___cd||"","none"===Q(c,"display")){b=c.style;c=c.tagName;if(U[c])c=U[c];else{var d=n(c);k.body.insertBefore(d,null);var h=Q(d,"display");k.body.removeChild(d);c=U[c]="none"!==h?h:"block"}b.display=c}}else c.___cd=Q(c,"display"),c.style.display="none"})};E.hide=function(){return this.toggle(!1)};E.show=function(){return this.toggle(!0)};function Ea(a,b){return!b||!u.call(b,function(b){return 0>a.indexOf(b)})}var V={focus:"focusin",blur:"focusout"},W={mouseenter:"mouseover",mouseleave:"mouseout"},Fa=/^(mouse|pointer|contextmenu|drag|drop|click|dblclick)/i;function Ga(a,b,c,d,h){var f=a.___ce=a.___ce||{};f[b]=f[b]||[];f[b].push([c,d,h]);a.addEventListener(b,h)}function X(a){a=a.split(".");return[a[0],a.slice(1).sort()]}function Y(a,b,c,d,h){var f=a.___ce=a.___ce||{};if(b)f[b]&&(f[b]=f[b].filter(function(f){var g=f[0],z=f[1];f=f[2];if(h&&f.guid!==h.guid||!Ea(g,c)||d&&d!==z)return!0;a.removeEventListener(b,f)}));else for(b in f)Y(a,b,c,d,h)}E.off=function(a,b,c){var d=this;if(void 0===a)this.each(function(a,b){(x(b)||w(b)||H(b))&&Y(b)});else if(C(a))D(b)&&(c=b,b=""),J(N(a),function(a,h){a=X(h);h=a[0];var f=a[1],g=W[h]||V[h]||h;d.each(function(a,d){(x(d)||w(d)||H(d))&&Y(d,g,f,b,c)})});else for(var h in a)this.off(h,a[h]);return this};E.on=function(a,b,c,d,h){var f=this;if(!C(a)){for(var g in a)this.on(g,b,c,a[g],h);return this}C(b)||(void 0!==b&&null!==b&&(void 0!==c&&(d=c),c=b),b="");D(d)||(d=c,c=void 0);if(!d)return this;J(N(a),function(a,g){a=X(g);g=a[0];var l=a[1],z=W[g]||V[g]||g,y=g in W,Ka=g in V;z&&f.each(function(a,f){if(x(f)||w(f)||H(f))a=function La(a){if(a.target["___i"+a.type])return a.stopImmediatePropagation();if(!a.namespace||Ea(l,a.namespace.split(".")))if(b||!(Ka&&(a.target!==f||a.___ot===z)||y&&a.relatedTarget&& f.contains(a.relatedTarget))){var g=f;if(b){for(var A=a.target;!sa(A,b);){if(A===f)return;A=A.parentNode;if(!A)return}g=A;a.___cd=!0}a.___cd&&Object.defineProperty(a,"currentTarget",{configurable:!0,get:function(){return g}});Object.defineProperty(a,"data",{configurable:!0,get:function(){return c}});A=d.call(g,a,a.___td);h&&Y(f,z,l,b,La);!1===A&&(a.preventDefault(),a.stopPropagation())}},a.guid=d.guid=d.guid||F.guid++,Ga(f,z,l,b,a)})});return this};E.one=function(a,b,c,d){return this.on(a,b,c,d,!0)};E.ready=function(a){function b(){return setTimeout(a,0,F)}"loading"!==k.readyState?b():k.addEventListener("DOMContentLoaded",b);return this};E.trigger=function(a,b){if(C(a)){var c=X(a),d=c[0];c=c[1];var h=W[d]||V[d]||d;if(!h)return this;var f=Fa.test(h)?"MouseEvents":"HTMLEvents";a=k.createEvent(f);a.initEvent(h,!0,!0);a.namespace=c.join(".");a.___ot=d}a.___td=b;var g=a.___ot in V;return this.each(function(b,c){g&&D(c[a.___ot])&&(c["___i"+a.type]=!0,c[a.___ot](),c["___i"+a.type]=!1);c.dispatchEvent(a)})};function Ha(a){return a.multiple&&a.options?O(t.call(a.options,function(a){return a.selected&&!a.disabled&&!a.parentNode.disabled}),"value"):a.value||""}var Ia=/%20/g,Ja=/\r?\n/g,Ma=/file|reset|submit|button|image/i,Na=/radio|checkbox/i;E.serialize=function(){var a="";this.each(function(b,c){J(c.elements||[c],function(b,c){c.disabled||!c.name||"FIELDSET"===c.tagName||Ma.test(c.type)||Na.test(c.type)&&!c.checked||(b=Ha(c),void 0!==b&&(b=q(b)?b:[b],J(b,function(b,d){b=a;d="&"+encodeURIComponent(c.name)+"="+encodeURIComponent(d.replace(Ja,"\r\n")).replace(Ia,"+");a=b+d})))})});return a.slice(1)};E.val=function(a){return arguments.length?this.each(function(b,c){if((b=c.multiple&&c.options)||Na.test(c.type)){var d=q(a)?ia.call(a,String):null===a?[]:[String(a)];b?J(c.options,function(a,b){b.selected=0<=d.indexOf(b.value)},!0):c.checked=0<=d.indexOf(c.value)}else c.value=void 0===a||null===a?"":a}):this[0]&&Ha(this[0])};E.clone=function(){return this.map(function(a,b){return b.cloneNode(!0)})};E.detach=function(a){M(this,a).each(function(a,c){c.parentNode&&c.parentNode.removeChild(c)});return this};var Oa=/^\s*<(\w+)[^>]*>/,Pa=/^<(\w+)\s*\/?>(?:<\/\1>)?$/,Qa={"*":ca,tr:da,td:ea,th:ea,thead:p,tbody:p,tfoot:p};function qa(a){if(!C(a))return[];if(Pa.test(a))return[n(RegExp.$1)];var b=Oa.test(a)&&RegExp.$1;b=Qa[b]||Qa["*"];b.innerHTML=a;return F(b.childNodes).detach().get()}F.parseHTML=qa;E.empty=function(){return this.each(function(a,b){for(;b.firstChild;)b.removeChild(b.firstChild)})};E.html=function(a){return arguments.length?void 0===a?this:this.each(function(b,c){x(c)&&(c.innerHTML=a)}):this[0]&&this[0].innerHTML};E.remove=function(a){M(this,a).detach().off();return this};E.text=function(a){return void 0===a?this[0]?this[0].textContent:"":this.each(function(b,c){x(c)&&(c.textContent=a)})};E.unwrap=function(){this.parent().each(function(a,b){"BODY"!==b.tagName&&(a=F(b),a.replaceWith(a.children()))});return this};E.offset=function(){var a=this[0];if(a)return a=a.getBoundingClientRect(),{top:a.top+m.pageYOffset,left:a.left+m.pageXOffset}};E.offsetParent=function(){return this.map(function(a,b){for(a=b.offsetParent;a&&"static"===Q(a,"position");)a=a.offsetParent;return a||ba})};E.position=function(){var a=this[0];if(a){var b="fixed"===Q(a,"position"),c=b?a.getBoundingClientRect():this.offset();if(!b){var d=a.ownerDocument;for(b=a.offsetParent||d.documentElement;(b===d.body||b===d.documentElement)&&"static"===Q(b,"position");)b=b.parentNode;b!==a&&x(b)&&(d=F(b).offset(),c.top-=d.top+R(b,"borderTopWidth"),c.left-=d.left+R(b,"borderLeftWidth"))}return{top:c.top-R(a,"marginTop"),left:c.left-R(a,"marginLeft")}}};E.children=function(a){return M(F(P(O(this,function(a){return a.children}))),a)};E.contents=function(){return F(P(O(this,function(a){return"IFRAME"===a.tagName?[a.contentDocument]:"TEMPLATE"===a.tagName?a.content.childNodes:a.childNodes})))};E.find=function(a){return F(P(O(this,function(b){return v(a,b)})))};var Ra=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,Sa=/^$|^module$|\/(java|ecma)script/i,Ta=["type","src","nonce","noModule"];function Ua(a,b){a=F(a);a.filter("script").add(a.find("script")).each(function(a,d){if(Sa.test(d.type)&&ba.contains(d)){var c=n("script");c.text=d.textContent.replace(Ra,"");J(Ta,function(a,b){d[b]&&(c[b]=d[b])});b.head.insertBefore(c,null);b.head.removeChild(c)}})}function Z(a,b,c,d,h,f,g,y){J(a,function(a,f){J(F(f),function(a,f){J(F(b),function(b,g){var l=c?g:f;b=c?a:b;g=c?f:g;l=b?l.cloneNode(!0):l;b=!b;h?g.insertBefore(l,d?g.firstChild:null):g.parentNode.insertBefore(l,d?g:g.nextSibling);b&&Ua(l,g.ownerDocument)},y)},g)},f);return b}E.after=function(){return Z(arguments,this,!1,!1,!1,!0,!0)};E.append=function(){return Z(arguments,this,!1,!1,!0)};E.appendTo=function(a){return Z(arguments,this,!0,!1,!0)};E.before=function(){return Z(arguments,this,!1,!0)};E.insertAfter=function(a){return Z(arguments,this,!0,!1,!1,!1,!1,!0)};E.insertBefore=function(a){return Z(arguments,this,!0,!0)};E.prepend=function(){return Z(arguments,this,!1,!0,!0,!0,!0)};E.prependTo=function(a){return Z(arguments,this,!0,!0,!0,!1,!1,!0)};E.replaceWith=function(a){return this.before(a).remove()};E.replaceAll=function(a){F(a).replaceWith(this);return this};E.wrapAll=function(a){a=F(a);for(var b=a[0];b.children.length;)b=b.firstElementChild;this.first().before(a);return this.appendTo(b)};E.wrap=function(a){return this.each(function(b,c){var d=F(a)[0];F(c).wrapAll(b?d.cloneNode(!0):d)})};E.wrapInner=function(a){return this.each(function(b,c){b=F(c);c=b.contents();c.length?c.wrapAll(a):b.append(a)})};E.has=function(a){var b=C(a)?function(b,d){return v(a,d).length}:function(b,d){return d.contains(a)};return this.filter(b)};E.is=function(a){var b=L(a);return u.call(this,function(a,d){return b.call(a,d,a)})};E.next=function(a,b,c){return M(F(P(O(this,"nextElementSibling",b,c))),a)};E.nextAll=function(a){return this.next(a,!0)};E.nextUntil=function(a,b){return this.next(b,!0,a)};E.not=function(a){var b=L(a);return this.filter(function(c,d){return(!C(a)||x(d))&&!b.call(d,c,d)})};E.parent=function(a){return M(F(P(O(this,"parentNode"))),a)};E.index=function(a){var b=a?F(a)[0]:this[0];a=a?this:F(b).parent().children();return ha.call(a,b)};E.closest=function(a){var b=this.filter(a);if(b.length)return b;var c=this.parent();return c.length?c.closest(a):b};E.parents=function(a,b){return M(F(P(O(this,"parentElement",!0,b))),a)};E.parentsUntil=function(a,b){return this.parents(b,a)};E.prev=function(a,b,c){return M(F(P(O(this,"previousElementSibling",b,c))),a)};E.prevAll=function(a){return this.prev(a,!0)};E.prevUntil=function(a,b){return this.prev(b,!0,a)};E.siblings=function(a){return M(F(P(O(this,function(a){return F(a).parent().children().not(a)}))),a)};"undefined"!==typeof exports?module.exports=F:m.cash=m.$=F;})();
 
 var elementos_css ={};
 var blocos_posicao ={};
 var elementos_posicao ={};
 var elementos_popup ={};
 var elementos_botoes_evento ={};
 var pagina_controle ={
 'classe_bloco':'gpc-b',
 'classe_elemento':'gpc-e',
 'classe_elemento_antigo':'gpc-elemento',
 'classe_elemento_interno':'c',
 'classe_elemento_interno_antigo':'conteudo',
 'elementos_timer':{}
};
 var largura_tela, altura_tela, timeout_resize;
 
 function GreatResize(){
 let tamanho_tela = $(window).width();
 let zoom_default = gpages_viewport_padrao();
 
 function iOS(){return ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document)}
 if(tamanho_tela <= 1200){
 let controle = 1200;
 if(tamanho_tela > 360 && tamanho_tela <= 800){
 $('.gpc-b').each(function(){if($(this).css('background-attachment') == 'fixed'){$(this).css('background-position','');}});
 if(iOS()){$('meta[name="viewport"]').attr('content',zoom_default);}
 else{$('body').css('zoom','');}
 return;
}else if(tamanho_tela <= 360){controle = 360;}
 let proporcao = (((tamanho_tela*100)/controle)).toFixed(5), novo_tamanho;
 novo_tamanho = (tamanho_tela-(tamanho_tela*(proporcao/100)));
 if(novo_tamanho != 0){
 $('.gpc-b').each(function(i,bloco){
 if($(bloco).css('background-attachment') == 'fixed'){
 if(iOS()){$(bloco).css('background-attachment','initial');}
 if($(bloco).position().top >= $(window).height()){$(bloco).css('background-position',$(bloco).css('background-position-x')+' 100%');}
 else{$(bloco).css('background-position',$(bloco).css('background-position-x')+' 0%');}
}
});
 if(iOS()){
 $('meta[name="viewport"]').attr('content',gpages_viewport_zoom(novo_tamanho,proporcao));
}else{$('body').css({'zoom':proporcao+'%'});}
}else{
 if(iOS()){
 $('.gpc-b').each(function(i,bloco){
 if($(bloco).css('background-attachment') == 'fixed'){
 $(bloco).css('background-attachment','initial');
 if($(bloco).position().top >= $(window).height()){$(bloco).css('background-position',$(bloco).css('background-position-x')+' 100%');}
 else{$(bloco).css('background-position',$(bloco).css('background-position-x')+' 0%');}
}
});
}
}
}else{
 $('.gpc-b').each(function(i,bloco){if($(bloco).css('background-attachment') == 'fixed'){$(bloco).css('background-position','');}});
 if(iOS()){$('meta[name="viewport"]').attr('content',zoom_default);}
 else{$('body').css('zoom','');}
}
}
 GreatResize();
 $(function(){GreatResize();});
 window.addEventListener('resize', function(e){
 e.preventDefault();
 e.stopPropagation();
 if(timeout_resize){clearTimeout(timeout_resize);timeout_resize = null;}
 largura_tela = $(window).width();
 altura_tela = $(window).height();
 timeout_resize = setTimeout(function(){
 if($(window).width() == largura_tela && $(window).height() == altura_tela){GreatResize();}
},50);
},{passive:true});
 
 function GreatFontesAplicar(raiz, fator){
 if (!(fator > 0)) { return; }
 raiz.each(function(){
 var nos = [this].concat(Array.prototype.slice.call(this.querySelectorAll('*')));
 var medidos = [], i, n;
 for (i = 0; i < nos.length; i++){
 n = nos[i];
 if (n.nodeType !== 1 || !n.style || typeof n.style.setProperty !== 'function') continue;
 if (typeof n.namespaceURI === 'string' && n.namespaceURI.indexOf('svg') !== -1) continue;
 medidos.push([n, parseFloat(window.getComputedStyle(n).fontSize)]);
}
 for (i = 0; i < medidos.length; i++){
 if (medidos[i][1] > 0){ medidos[i][0].style.setProperty('font-size', (medidos[i][1]/(fator*fator))+'px', 'important'); }
}
});
}
 function GreatFontes(modal){
 if(modal == undefined){modal = false;}
 if((navigator.userAgent.match(/Android/i) && $(window).width() <= 800 && navigator.userAgent.match(/Instagram|FBAN|FBAV|FB_IAB|WhatsApp|BytedanceWebview|musical_ly|TikTok|Line\/|KAKAOTALK/i)) || (navigator.userAgent.match(/iPhone/i) && $(window).width() < 360)){
 
 $((modal ? '.gm ':'')+'.gpc-e').each(function(){
 
 var elemento = $(this);
 var elemento_id = elemento.attr('id');
 
 if (elementos_css.hasOwnProperty(elemento_id)){
 
 var elemento_conteudo = (elemento.hasClass('e_formulario') ? elemento.find('.gpc_botao') :elemento.children('.c'));
 if(!elemento_conteudo.length){ elemento_conteudo = elemento.children('[class*="typography-"]').first(); }
 
 if (Math.abs(parseFloat(elemento_conteudo.css('font-size')) - parseFloat(elementos_css[elemento_id]['fs'])) > 0.5){
 
 var fator = parseFloat(elemento_conteudo.css('font-size'))/parseFloat(elementos_css[elemento_id]['fs']);
 
 GreatFontesAplicar(elemento_conteudo, fator);
 
 if (elementos_css[elemento_id]['lh']){
 
 elemento_conteudo.css('line-height',elementos_css[elemento_id]['lh']);
}
 
 if (elemento.hasClass('e_timer')){
 
 if (parseFloat(elemento_conteudo.css('font-size')) != elementos_css[elemento_id]['fs']){
 elemento_conteudo.find('.contador_titulos').css('line-height','1');
 elemento_conteudo.find('.contador_itens').children('span').css('line-height','1.2');
}
}else if (elemento.hasClass('e_formulario')){
 
 var fieldset = elemento.find('fieldset');
 if (fieldset.length){ GreatFontesAplicar(fieldset, fator); }
}
}
}
});
}
}
 $(function(){
 
 GreatFontes();
});
 
 
 $(function(){GreatLoader('iniciar');});
 
 var gle_fontes ={}, gle_css ={}, gle_scripts ={};
 
 function GreatLoader(acao){
 
 
 gle_fontes['elementos'] = $('.gle_fontes');
 gle_fontes['encontrados'] = gle_fontes['elementos'].length;
 gle_fontes['carregados'] = 0;
 
 if (gle_fontes['encontrados'] != 0){
 InserirFontes(acao);
 setTimeout(function(){CarregarFontes();},4500);
}else{CarregarFontes();}
 
 setTimeout(function(){
 
 gle_scripts['elementos'] = $('.gle_scripts');
 gle_scripts['encontrados'] = gle_scripts['elementos'].length;
 gle_scripts['carregados'] = 0;
 
 if (gle_scripts['encontrados'] != 0){
 InserirScripts(acao);
}else{if (acao == 'iniciar'){if (window.InserirScriptsInline != undefined){InserirScriptsInline();}}}
},20);
 
 setTimeout(function(){
 
 gle_css = $('.gle_css');
 
 InserirCss(acao);
},30);
 
 setTimeout(function(){
 GObserver.instalar({
 'elemento' :'.e_animacoes',
 'antecipacao' :0,
 'executar' :function(elemento){
 (function(elemento){
 var elemento_carregando = setInterval(function(){
 if (!$(elemento).hasClass('se_imagem') && !$(elemento).hasClass('se_video') && !$(elemento).hasClass('se_caixa') && !$(elemento).find('.c').hasClass('se_fonte') && !$(elemento).hasClass('se_slider')){
 
 clearInterval(elemento_carregando);
 
 var elemento_id = $(elemento).attr('id').replace('_d', '').replace('_m', '');
 var elemento_informacoes = ($(elemento).hasClass('e_video') && $(elemento).find('.carregando').length ? $(elemento).find('.carregando') :$(elemento).find('.c'));
 var animacao_nome = $(elemento_informacoes).attr('data-animation-nome');
 var animacao_duration = ($(elemento_informacoes).attr('data-animation-duration') ? $(elemento_informacoes).attr('data-animation-duration')+'ms' :'1000ms');
 var animacao_delay = ($(elemento_informacoes).attr('data-animation-delay') ? $(elemento_informacoes).attr('data-animation-delay')+'ms' :'0ms');
 var animacao_repeat = ($(elemento_informacoes).attr('data-animation-repeat') == 'loop' ? 'infinite' :'');
 
 if (animacao_nome == 'slide' || animacao_nome == 'zoom' || animacao_nome == 'flip'){var animacao_tipo = 'cubic-bezier(.25,.46,.45,.94)';}
 else if (animacao_nome == 'fade'){var animacao_tipo = 'cubic-bezier(0.390, 0.575, 0.565, 1.000)';}
 else if (animacao_nome == 'roll'){var animacao_tipo = 'ease-out';}
 else if (animacao_nome == 'fold'){var animacao_tipo = 'cubic-bezier(.175,.885,.32,1.275)';}
 else{var animacao_tipo = '';}
 
 $(elemento).removeClass('e_animacoes');
 if($(elemento).hasClass('e_faq')){
 var itens = $(elemento).find('.gac-item');
 for (var i = 0;i < itens.length;i++){
 $(itens[i]).css({
 'animation':elemento_id+'_animacao '+animacao_duration+' '+animacao_tipo+' '+(parseInt(animacao_delay)+(500*i))+'ms '+animacao_repeat+' both',
 '-webkit-animation':elemento_id+'_animacao '+animacao_duration+' '+animacao_tipo+' '+(parseInt(animacao_delay)+(500*i))+'ms '+animacao_repeat+' both',
 'transform':'translate3d(0,0,0)',
 '-webkit-transform':'translate3d(0,0,0)'
 });
}
}else{
 $(elemento).find('.c').css({
 'animation':elemento_id+'_animacao '+animacao_duration+' '+animacao_tipo+' '+animacao_delay+' '+animacao_repeat+' both',
 '-webkit-animation':elemento_id+'_animacao '+animacao_duration+' '+animacao_tipo+' '+animacao_delay+' '+animacao_repeat+' both',
 'transform':'translate3d(0,0,0)',
 '-webkit-transform':'translate3d(0,0,0)'
});
}
 
 $(elemento_informacoes).removeAttr('data-animation-nome data-animation-duration data-animation-delay data-animation-repeat');
 }
}, 50);
})(elemento);
}
});
},30);
 
 setTimeout(function(){
 GObserver.instalar({
 'elemento' :'.se_imagem',
 'antecipacao' :600,
 'executar' :function(elemento){
 
 if (elemento.querySelector('picture')){elemento.classList.remove('se_imagem');elemento.removeAttribute('ll_src');elemento.removeAttribute('ll_src_mobile');return;}
 
 if (window.innerWidth <= 800){var dispositivo = 'mobile';}else if (window.innerWidth > 800){var dispositivo = 'desktop';}

 var img_mobile = elemento.getAttribute('ll_src_mobile');
 var img_desktop = elemento.getAttribute('ll_src');
 if (img_mobile == 'null' || img_mobile == 'undefined'){img_mobile = null;}
 if (img_desktop == 'null' || img_desktop == 'undefined'){img_desktop = null;}
 var src_desktop = img_desktop || img_mobile;
 var src_mobile = img_mobile || src_desktop;
 var interno_img = elemento.querySelector('.'+pagina_controle['classe_elemento_interno']);
 var ll_largura = (interno_img && interno_img.getAttribute('gpc_largura_imagem')) ? interno_img.getAttribute('gpc_largura_imagem') :'';
 var ll_altura = (interno_img && interno_img.getAttribute('gpc_altura_imagem')) ? interno_img.getAttribute('gpc_altura_imagem') :'';
 var alt_raw = elemento.getAttribute('data-ll-alt') || '';
 var src_download = (dispositivo == 'mobile' && img_mobile) ? img_mobile :(img_desktop || img_mobile);

 if (!src_download){
 elemento.removeAttribute('ll_src');
 elemento.removeAttribute('ll_src_mobile');
 elemento.removeAttribute('data-ll-alt');
 if (interno_img){
 interno_img.removeAttribute('data-ll-alt');
 interno_img.removeAttribute('gpc_ratio_imagem');
 interno_img.removeAttribute('gpc_altura_imagem');
 interno_img.removeAttribute('gpc_largura_imagem');
}
 elemento.classList.remove('se_imagem');
 if (elemento.children[0]){elemento.children[0].innerHTML = '<div class="imagem_fundo fallback_background"></div>';}
 return;
}

 var imagem_download = new Image();

 imagem_download.onload = function(e){
 if (imagem_download.decode && !imagem_download.__decodificada){
 imagem_download.__decodificada = 1;
 imagem_download.decode().then(function(){imagem_download.onload(e);}).catch(function(){imagem_download.onload(e);});
 return;
}

 imagem_download.onload = null;
 imagem_download.onerror = null;

 elemento.removeAttribute('ll_src');
 elemento.removeAttribute('ll_src_mobile');
 elemento.removeAttribute('data-ll-alt');
 if (interno_img){
 interno_img.removeAttribute('data-ll-alt');
 interno_img.removeAttribute('gpc_ratio_imagem');
 interno_img.removeAttribute('gpc_altura_imagem');
 interno_img.removeAttribute('gpc_largura_imagem');
}
 elemento.classList.remove('se_imagem');
 var container = elemento.children[0];
 if (!container){return;}
 while (container.firstChild){container.removeChild(container.firstChild);}
 if (ll_largura && ll_altura){
 var source = document.createElement('source');
 source.setAttribute('media', '(max-width: 800px)');
 source.setAttribute('srcset', src_mobile);
 var picture = document.createElement('picture');
 picture.appendChild(source);
 imagem_download.className = 'imagem_fundo';
 imagem_download.alt = alt_raw;
 imagem_download.setAttribute('width', ll_largura);
 imagem_download.setAttribute('height', ll_altura);
 picture.appendChild(imagem_download);
 container.appendChild(picture);
}else{
 var fundo = document.createElement('div');
 fundo.className = 'imagem_fundo';
 container.appendChild(fundo);
}
};
 imagem_download.onerror = function(e){

 elemento.removeAttribute('ll_src');
 elemento.removeAttribute('ll_src_mobile');
 elemento.removeAttribute('data-ll-alt');
 if (interno_img){
 interno_img.removeAttribute('data-ll-alt');
 interno_img.removeAttribute('gpc_ratio_imagem');
 interno_img.removeAttribute('gpc_altura_imagem');
 interno_img.removeAttribute('gpc_largura_imagem');
}
 elemento.classList.remove('se_imagem');
 if (elemento.children[0]){elemento.children[0].innerHTML = '<div class="imagem_fundo fallback_background"></div>';}
};
 imagem_download.src = src_download;
}
});
},40);
 
 setTimeout(function(){
 GObserver.instalar({
 'elemento' :'.se_caixa',
 'antecipacao' :500,
 'executar' :function(elemento){
 
 if (window.innerWidth <= 800){var dispositivo = 'mobile';}else if (window.innerWidth > 800){var dispositivo = 'desktop';}
 
 var elemento_carregando_src = '';
 if (dispositivo == 'mobile' && elemento.getAttribute('ll_src_mobile')){elemento_carregando_src = elemento.getAttribute('ll_src_mobile');}
 else if (dispositivo == 'desktop' && elemento.getAttribute('ll_src')){elemento_carregando_src = elemento.getAttribute('ll_src');}
 if (elemento_carregando_src && elemento_carregando_src != 'null' && elemento_carregando_src != 'undefined'){
 
 var imagem_download = new Image();
 imagem_download.src = elemento_carregando_src;
 imagem_download.onload = function(e){
 if (imagem_download.decode && !imagem_download.__decodificada){
 imagem_download.__decodificada = 1;
 imagem_download.decode().then(function(){imagem_download.onload(e);}).catch(function(){imagem_download.onload(e);});
 return;
}
 
 elemento.removeAttribute('ll_src');
 elemento.removeAttribute('ll_src_mobile');
 elemento.classList.remove('se_caixa');
};
 imagem_download.onerror = function(e){
 elemento.removeAttribute('ll_src');
 elemento.removeAttribute('ll_src_mobile');
 elemento.classList.remove('se_caixa');
 elemento.children[0].classList.add('fallback_background');
};
}else{
 elemento.classList.remove('se_caixa');
 elemento.removeAttribute('ll_src');
 elemento.removeAttribute('ll_src_mobile');
}
}
});
},40);
 
 setTimeout(function(){
 GObserver.instalar({
 'elemento' :'.se_slider',
 'antecipacao' :500,
 'executar' :function(elemento){
 
 if (window.innerWidth <= 800){var dispositivo = 'mobile';}
 else if (window.innerWidth > 800){var dispositivo = 'desktop';}
 
 var imagens = $(elemento).find('.imagem');
 if(imagens.length){
 imagens.each(function(i,imagem){
 var elemento_carregando_src = '';
 if (dispositivo == 'mobile' && imagem.getAttribute('ll_src_mobile')){elemento_carregando_src = imagem.getAttribute('ll_src_mobile');}
 else if (dispositivo == 'desktop' && imagem.getAttribute('ll_src')){elemento_carregando_src = imagem.getAttribute('ll_src');}
 if (elemento_carregando_src && elemento_carregando_src != 'null' && elemento_carregando_src != 'undefined'){
 
 var imagem_download = new Image();
 imagem_download.src = elemento_carregando_src;
 imagem_download.onload = function(e){
 if (imagem_download.decode && !imagem_download.__decodificada){
 imagem_download.__decodificada = 1;
 imagem_download.decode().then(function(){imagem_download.onload(e);}).catch(function(){imagem_download.onload(e);});
 return;
}
 
 imagem.removeAttribute('ll_src');
 imagem.removeAttribute('ll_src_mobile');
 imagem.closest('.'+pagina_controle['classe_elemento']).classList.remove('se_slider');
 if(imagem.classList.contains('gsi_clone')){imagem.style.backgroundImage = 'url('+elemento_carregando_src+')';}
};
 imagem_download.onerror = function(e){
 
 imagem.removeAttribute('ll_src');
 imagem.removeAttribute('ll_src_mobile');
 try{
 imagem.closest('.'+pagina_controle['classe_elemento']).classList.remove('se_slider');
 imagem.closest('.'+pagina_controle['classe_elemento']).children[0].classList.add('fallback_background');
 let id_slider = `gsi_${elemento.closest('.'+pagina_controle['classe_elemento']).getAttribute('id')}`;
 if(gsi_intervalo.hasOwnProperty(id_slider)){
 GSlideImage.destruir(id_slider);
 GSlideImage.iniciar(elemento.closest('.'+pagina_controle['classe_elemento']).getAttribute('id'));
 }else{
 GSlideImage.iniciar(elemento.closest('.'+pagina_controle['classe_elemento']).getAttribute('id'));
 }
}catch (error){
}
};
 }else{
 imagem.closest('.'+pagina_controle['classe_elemento']).classList.remove('se_slider');
 imagem.removeAttribute('ll_src');
 imagem.removeAttribute('ll_src_mobile');
 }
});
}
}
});
},400);
 
 setTimeout(function(){
 GObserver.instalar({
 'elemento' :'.ll_background',
 'antecipacao' :500,
 'executar' :function(elemento){
 
 if (window.innerWidth <= 800){var dispositivo = 'mobile';}
 else if (window.innerWidth > 800){var dispositivo = 'desktop';}
 
 var elemento_carregando_src = '';
 if (dispositivo == 'mobile' && elemento.getAttribute('ll_src_mobile')){elemento_carregando_src = elemento.getAttribute('ll_src_mobile');}
 else if (dispositivo == 'desktop' && elemento.getAttribute('ll_src')){elemento_carregando_src = elemento.getAttribute('ll_src');}
 if (elemento_carregando_src && elemento_carregando_src != 'null' && elemento_carregando_src != 'undefined'){
 
 var background_download = new Image();
 background_download.src = elemento_carregando_src;
 background_download.onload = function(e){
 
 elemento.removeAttribute('ll_src');
 elemento.removeAttribute('ll_src_mobile');
 elemento.classList.remove('ll_background');
};
 background_download.onerror = function(e){
 elemento.removeAttribute('ll_src');
 elemento.removeAttribute('ll_src_mobile');
 elemento.classList.remove('ll_background');
 elemento.classList.add('fallback_background');
};
}else{
 
 elemento.removeAttribute('ll_src');
 elemento.removeAttribute('ll_src_mobile');
 elemento.classList.remove('ll_background');
 elemento.classList.add('fallback_background');
}
}
});
},50);
 
 setTimeout(function(){
 GObserver.instalar({
 'elemento' :'.se_video',
 'antecipacao' :0,
 'executar' :function(elemento){
 
 if(document.getElementById(elemento.getAttribute('id')).getElementsByTagName('iframe').length == 0){
 
 var animacao_nome = (elemento.querySelector('.carregando').getAttribute('data-animation-nome') ? elemento.querySelector('.carregando').getAttribute('data-animation-nome') :'none');
 var animacao_duration = (elemento.querySelector('.carregando').getAttribute('data-animation-duration') ? elemento.querySelector('.carregando').getAttribute('data-animation-duration') :1000);
 var animacao_delay = (elemento.querySelector('.carregando').getAttribute('data-animation-delay') ? elemento.querySelector('.carregando').getAttribute('data-animation-delay') :0);
 var animacao_repeat = (elemento.querySelector('.carregando').getAttribute('data-animation-repeat') == 'loop' ? 'infinite' :'show');
 
 var video_download = document.createElement("iframe");
 console.log(elemento.getAttribute('ll_src'));
 video_download.setAttribute('src', elemento.getAttribute('ll_src'));
 video_download.setAttribute('frameborder', 0);
 video_download.setAttribute('allowfullscreen', '');
 video_download.setAttribute('mozallowfullscreen', '');
 video_download.setAttribute('webkitallowfullscreen', '');
 video_download.setAttribute('allow', 'accelerometer;autoplay;picture-in-picture');
 video_download.setAttribute('class', 'c e_video');
 video_download.setAttribute('data-animation-nome', animacao_nome);
 video_download.setAttribute('data-animation-duration', animacao_duration);
 video_download.setAttribute('data-animation-delay', animacao_delay);
 video_download.setAttribute('data-animation-repeat', animacao_repeat);
 video_download.onload = function(){
 if(document.getElementById(elemento.getAttribute('id')).querySelector('.carregando')){
 document.getElementById(elemento.getAttribute('id')).querySelector('.carregando').remove();
 }
 elemento.removeAttribute('ll_src');
 elemento.classList.remove('se_video');
};
 video_download.onreadystatechange = function(){
 if(document.getElementById(elemento.getAttribute('id')).querySelector('.carregando')){
 document.getElementById(elemento.getAttribute('id')).querySelector('.carregando').remove();
 }
 if (this.readyState == 'complete'){
 elemento.removeAttribute('ll_src');
 elemento.classList.remove('se_video');
 }
};
 
 document.getElementById(elemento.getAttribute('id')).appendChild(video_download);
}
}
});
},400);
}
 
 function InserirFontes(acao){
 if (gle_fontes['elementos'].length){
 for(var i = 0;i < gle_fontes['elementos'].length;i++){
 
 (function(index){
 
 var elemento = $(gle_fontes['elementos'][index]);
 
 gle_fontes['elementos'].splice(index, 1);
 
 var fonte = document.createElement('link');
 fonte.href = elemento.attr('gle_href');
 fonte.rel = 'stylesheet';
 fonte.media = 'all';
 fonte.onload = function(){
 
 elemento.remove();
 
 gle_fontes['carregados']++;
 
 CarregarFontes();
 
 InserirFontes(acao);
};
 fonte.onerror = function(){
 
 elemento.remove();
 
 gle_fontes['carregados']++;
 
 CarregarFontes();
 
 InserirFontes(acao);
};
 fonte.onreadystatechange = function(){if (this.readyState == 'complete'){
 
 elemento.remove();
 
 gle_fontes['carregados']++;
 
 CarregarFontes();
 
 InserirFontes(acao);
}};
 document.head.appendChild(fonte);
})(i, acao);
 
 break;
}
}
}
 function CarregarFontes(){
 var fontes_carregar = $('.se_fonte, .se_contador');
 if (fontes_carregar.length){
 for(var i = 0;i < fontes_carregar.length;i++){
 
 if ($(fontes_carregar[i]).hasClass('se_fonte')){$(fontes_carregar[i]).removeClass('se_fonte');}
 else{$(fontes_carregar[i]).removeClass('se_contador');}
}
}
}
 
 function InserirCss(acao){
 if (gle_css.length){
 for(var i = 0;i < gle_css.length;i++){
 
 (function(index){
 
 var elemento = $(gle_css[index]);
 
 gle_css.splice(index, 1);
 
 var fonte = document.createElement('link');
 
 for (var x = 0;x < elemento[0].attributes.length;x++){
 if(elemento[0].attributes[x].nodeName != 'rel'){fonte.setAttribute(elemento[0].attributes[x].nodeName.replace('gle_',''),elemento[0].attributes[x].nodeValue.replace('gle_css',''));}
}
 
 fonte.onload = function(){
 
 elemento.remove();
 
 InserirCss(acao);
};
 fonte.onerror = function(){
 
 elemento.remove();
 
 InserirCss(acao);
};
 fonte.onreadystatechange = function(){if (this.readyState == 'complete'){
 
 elemento.remove();
 
 InserirCss(acao);
}};
 document.body.appendChild(fonte);
})(i, acao);
 
 break;
}
}
}
 
 function InserirScripts(acao){
 if (gle_scripts['elementos'].length){
 for(var i = 0;i < gle_scripts['elementos'].length;i++){
 
 (function(index){
 
 var elemento = $(gle_scripts['elementos'][index]);
 
 gle_scripts['elementos'].splice(index, 1);
 
 var script = document.createElement('script');
 
 for (var x = 0;x < elemento[0].attributes.length;x++){
 let valor = elemento[0].attributes[x].nodeValue;
 if(elemento[0].attributes[x].nodeName != 'href'){
 valor = valor.replace(/dns-prefetch\s+?/gm,'');
 valor = valor.replace(/\s+?dns-prefetch/gm,'');
 valor = valor.replace(/preconnect\s+?/gm,'');
 valor = valor.replace(/\s+?preconnect/gm,'');
 valor = valor.replace('dns-prefetch','');
 valor = valor.replace('preconnect','');
 valor = valor.replace('gle_scripts','');
 if(elemento[0].attributes[x].nodeName != 'async'){script.setAttribute(elemento[0].attributes[x].nodeName,valor);}
}
}
 script.src = elemento.attr('href');
 script.type = 'text/javascript';
 script.defer = true;
 script.onload = function(){
 
 elemento.remove();
 
 gle_scripts['carregados']++;
 
 if (gle_scripts['encontrados'] == gle_scripts['carregados'] && acao == 'iniciar'){
 if (window.InserirScriptsInline != undefined){InserirScriptsInline();}
}
 
 InserirScripts(acao);
};
 script.onerror = function(){
 
 elemento.remove();
 
 gle_scripts['carregados']++;
 
 if (gle_scripts['encontrados'] == gle_scripts['carregados'] && acao == 'iniciar'){
 if (window.InserirScriptsInline != undefined){InserirScriptsInline();}
}
 
 InserirScripts(acao);
};
 script.onreadystatechange = function(){if (this.readyState == 'complete'){
 
 elemento.remove();
 
 gle_scripts['carregados']++;
 
 if (gle_scripts['encontrados'] == gle_scripts['carregados'] && acao == 'iniciar'){
 if (window.InserirScriptsInline != undefined){InserirScriptsInline();}
}
 
 InserirScripts(acao);
}};
 document.body.appendChild(script);
})(i, acao);
 
 break;
}
}
}
 
 
 if($('.'+pagina_controle['classe_elemento']+'.e_faq').length){
 setTimeout(function(){
 GAccordion.instalar();
},600);
}
 
 
 let phoneMaskGreat ={}, phoneMaskGreatCampo ={};
 function PhoneMaskIniciado(tel, id_campo){
 if(tel.parentNode && tel.parentNode.classList.contains('iti')){return true;}
 if(typeof phoneMaskGreat[id_campo] == 'object'){
 if(!phoneMaskGreatCampo[id_campo] || !document.contains(phoneMaskGreatCampo[id_campo])){try{phoneMaskGreat[id_campo].destroy();}catch(erro){}}
 delete phoneMaskGreat[id_campo];
 delete phoneMaskGreatCampo[id_campo];
}
 return false;
}
 // lista inline no mobile: enquanto aberta, sobe a linha do campo E o fieldset do passo — o
 // fieldset tem transform (passos do formulario), o que cria stacking context proprio; sem
 // subir o fieldset, o botao de enviar (z-index:50, irmao do fieldset) pinta por cima da lista.
 // Restaura ao fechar para nao interferir na sobreposicao dos passos do formulario.
 function SubirCampoListaDdi(evento){
 if(!Mobile()){return;}
 let campos = $(evento.target).closest('.gpc_campos');
 campos.css('z-index','9999');
 campos.closest('fieldset').css('z-index','9999');
}
 function RestaurarCampoListaDdi(evento){
 if(!Mobile()){return;}
 let campos = $(evento.target).closest('.gpc_campos');
 campos.css('z-index','');
 campos.closest('fieldset').css('z-index','');
}
 function bindEvents(){
 var caixa = $('gmf').last().attr('id');
 if(caixa != undefined){caixa = '#'+caixa+' ';}else{caixa = '';}
 
 let telefone = $(caixa+".gpc_campo.telefone");
 let telefone_ddi = $(caixa+".gpc_campo.telefone_ddi");
 if(telefone.length > 0){
 for (let i = 0;i < telefone.length;i++){
 const tel = telefone[i];
 let id_campo = '#'+$(tel).closest('.gpc-e').attr('id')+'#'+$(tel).attr('id');
 if(PhoneMaskIniciado(tel, id_campo)){continue;}
 phoneMaskGreat[id_campo] = window.intlTelInput(tel,{
 useFullscreenPopup:false,
 autoPlaceholder:"off",
 strictMode:true,
 initialCountry:"BR",
 onlyCountries:["BR"],
 allowDropdown:false,
 showFlags:false,
 utilsScript:"https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/25.3.1/build/js/intlTelInputWithUtils.min.js"
});
 phoneMaskGreatCampo[id_campo] = tel;
}
 
}
 if(telefone_ddi.length > 0){
 for (let i = 0;i < telefone_ddi.length;i++){
 const tel = telefone_ddi[i];
 let id_campo = '#'+$(tel).closest('.gpc-e').attr('id')+'#'+$(tel).attr('id');
 if(PhoneMaskIniciado(tel, id_campo)){continue;}
 phoneMaskGreat[id_campo] = window.intlTelInput(tel,{
 initialCountry:"BR",
 separateDialCode:true,
 useFullscreenPopup:false,
 strictMode:true,
 // no mobile a lista fica inline (posicionada pela lib dentro do proprio .iti): mesmo espaco de
 // coordenadas do campo, entao zoom/viewport escalado/teclado nao desalinham, e a lib nem
 // registra o listener que fecha a lista em qualquer scroll da window (so existe com
 // dropdownContainer) — era ele que fechava a lista sozinha no iOS, porque o foco da busca sobe
 // o teclado e o Safari rola a pagina. No desktop a lista segue no body para escapar do
 // overflow dos pop-ups.
 dropdownContainer:Mobile() ? null : document.body,
 utilsScript:"https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/25.3.1/build/js/intlTelInputWithUtils.min.js"
});
 phoneMaskGreatCampo[id_campo] = tel;
 tel.addEventListener('open:countrydropdown', SubirCampoListaDdi);
 tel.addEventListener('close:countrydropdown', RestaurarCampoListaDdi);
 $(tel).on('countrychange', function(e){
 
 let countryData = phoneMaskGreat['#'+$(this).closest('.gpc-e').attr('id')+'#'+$(this).attr('id')].getSelectedCountryData();
 if (countryData.dialCode){
 tel.value = tel.value.replace(`+${countryData.dialCode}`, "");
 tel.value = tel.value.replace(`+ ${countryData.dialCode}`, "");
}
 
 ValidacaoCampos($(caixa+'#'+$(this).attr('id')));
});
}
}
 GFM.instalar({'elemento' :'#celular', 'mascara' :'(00) 0000-00009', 'placeholder' :'(__) ____-_____'});
 GFM.instalar({'elemento' :'input.cnpj', 'mascara' :'00.000.000/0000-00', 'placeholder' :'__.___.___/____-__'});
 GFM.instalar({'elemento' :'input.cpf', 'mascara' :'000.000.000-00', 'placeholder' :'___.___.___-__'});
 GFM.instalar({'elemento' :'input.hora', 'mascara' :'00:00', 'placeholder' :'__:__'});
 GFM.instalar({'elemento' :'input.data', 'mascara' :'00/00/0000', 'placeholder' :'__/__/____'});
 GFM.instalar({'elemento' :'input.datahora', 'mascara' :'00/00/0000 00:00', 'placeholder' :'__/__/____ __:__'});
 
 GTooltip.instalar({'elemento' :'.gtt-direita', 'direcao' :'direita'});
 GTooltip.instalar({'elemento' :'.gtt-esquerda', 'direcao' :'esquerda'});
 GTooltip.instalar({'elemento' :'.gtt-cima', 'direcao' :'cima'});
 GTooltip.instalar({'elemento' :'.gtt-baixo', 'direcao' :'baixo'});
 GTooltip.instalar({'elemento' :'.balao_direita', 'direcao' :'direita'});
 GTooltip.instalar({'elemento' :'.balao_esquerda', 'direcao' :'esquerda'});
 GTooltip.instalar({'elemento' :'.balao_cima', 'direcao' :'cima'});
 GTooltip.instalar({'elemento' :'.balao_baixo', 'direcao' :'baixo'});
}
 function Mobile(){
 if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ){return true;}
 return false;
}
 window.smoothScrollTo = function (endX, endY, duration){
 let startX = window.scrollX || window.pageXOffset,
 startY = window.scrollY || window.pageYOffset,
 distanceX = endX - startX,
 distanceY = endY - startY,
 startTime = new Date().getTime();
 let easeInOutQuart = function (time, from, distance, duration){
 if ((time /= duration / 2) < 1) return distance / 2 * time * time * time * time + from;
 return -distance / 2 * ((time -= 2) * time * time * time - 2) + from;
};
 let timer = window.setInterval(function (){
 let time = new Date().getTime() - startTime,
 newX = easeInOutQuart(time, startX, distanceX, duration),
 newY = easeInOutQuart(time, startY, distanceY, duration);
 if (time >= duration){
 window.clearInterval(timer);
}
 window.scrollTo(newX, newY);
}, 1000 / 60);
};
 // scroller real da página: window por padrão; o <body> (ou container) quando o CSS o torna o que rola
 window.gScrollEl = function(){
 var h = document.documentElement, b = document.body;
 if (b && b.scrollHeight > (b.clientHeight + 1) && h.scrollHeight <= (h.clientHeight + 1)){
 var oy = window.getComputedStyle(b).overflowY;
 if (oy == 'auto' || oy == 'scroll' || oy == 'hidden'){return b;}
}
 return null;
};
 window.gScrollTop = function(){var e = window.gScrollEl();return e ? e.scrollTop : (window.scrollY || window.pageYOffset || 0);};
 window.gScrollSet = function(y, smooth){
 var e = window.gScrollEl();
 if (smooth && ('scrollBehavior' in document.documentElement.style)){
 if (e){e.scrollTo({top:y, behavior:'smooth'});}else{window.scroll({top:y, behavior:'smooth'});}
}else{
 if (e){e.scrollTop = y;}else{window.scroll({top:y, behavior:'auto'});}
}
};
 $(function(){
 
 GLoading.carregar({'ativar':false});
 
 $('body').removeClass('preload');
 
 bindEvents();
 
 // a lista de DDI vive no <body> (dropdownContainer): a lib so fecha no scroll da window,
 // entao repassamos o scroll de qualquer container interno (ex.: .gpc_modal_popup-centro).
 document.addEventListener('scroll', function(evento){
 if(!evento.target || !evento.target.closest || evento.target.closest('.iti--container')){return;}
 if(!document.querySelector('.iti--container .iti__dropdown-content:not(.iti__hide)')){return;}
 window.dispatchEvent(new Event('scroll'));
}, true);
 
 $('.mensagem_fechar').on('click',function(evento){$('.mensagens').removeAttr('style');});
 
 $(document).on('keydown', function(e){
 var tecla = (e.keyCode?e.keyCode:e.which);
 if($('.gm').length){
 var caixa = $('.gm').last().attr('id');
 var caixa_andamento = $('#'+caixa).find('.gmf-andamento');
 if((e.ctrlKey && tecla == 83)){
 e.preventDefault();
 e.stopPropagation();
 if (caixa_andamento.length){
 if (caixa_andamento.attr('caixa_passos_controle') == (caixa_andamento.attr('caixa_passos_quantidade')-1)){$('#'+caixa+' #enviar_formulario_ajax').trigger('click');}
 else{PassosGMF(caixa, 'proximo');}
}else{$('#'+caixa+' #enviar_formulario_ajax').trigger('click');}
 return false;
}else if(tecla == 27){
 e.preventDefault();
 e.stopPropagation();
 if ($('#'+caixa).attr('gm_componente') == 'gsp'){FecharGSP(caixa);}
 else if($('#'+caixa).attr('gm_componente') == 'gmf'){$('#'+caixa+' .gmf-topo-fechar').click();}
 else if($('#'+caixa).attr('gm_componente') == 'guo' || $('#'+caixa).attr('gm_componente') == 'gd'){PulsarGM($('#'+caixa).attr('id'));}
 else if ($('#'+caixa).attr('gm_componente') == 'gmi'){
 
 gmi_caixa['elemento'] = '';
 gmi_caixa_imagem['elemento'] = '';
 gmi_fundo['elemento'] = '';
 
 FecharGM(caixa);
}else{FecharGM(caixa);}
 return false;
}
}else{
 if((e.ctrlKey && tecla == 83)){
 e.preventDefault();
 e.stopPropagation();
 if($('#editar_formulario').length){$('#editar_formulario').trigger('click');}
 else if($('#enviar_formulario').length){$('#enviar_formulario').trigger('click');}
 else if($('.admin_botao-login').length){$('.admin_botao-login').trigger('click');}
 else if($('.admin_botao-esqueci_minha_senha').length){$('.admin_botao-esqueci_minha_senha').trigger('click');}
 return false;
}
}
 if((e.ctrlKey && tecla == 85) || tecla == 123){
 e.preventDefault();
 e.stopPropagation();
 return false;
}
});
 
 $('body').on('click','.botao_evento',function(e){
 
 elementos_botoes_evento[$(this).parent().attr('id')]['conteudo']();
});
 
 $('body').on('click','.link_popup',function(e){
 if($(this).closest('.'+pagina_controle['classe_elemento'])){var elemento = $(this).closest('.'+pagina_controle['classe_elemento']);}
 else{var elemento = $(this).closest('.'+pagina_controle['classe_elemento_antigo']);}
 
 var conteudo = elementos_popup[elemento.attr('id')]['conteudo'];
 if(conteudo == undefined || conteudo == ''){conteudo = '<div></div>';}
 
 gm_quantidade++;
 
 var configuracao ={
 'gm' :{
 'conteudos' :{
 'topo' :{
 'conteudo' :"<div class='gpc_modal_popup-topo-fechar icone-fechar'></div>",
 'estilos' :'',
 'extras' :''
},
 'centro' :{
 'conteudo' :conteudo,
 'estilos' :'',
 'extras' :''
},
 'rodape' :{
 'conteudo' :'<div></div>',
 'estilos' :'',
 'extras' :''
}
},
 'classes' :'gpc_modal',
 'estilos' :elementos_popup[elemento.attr('id')]['estilos'][($(window).width() > 960 ? 'desktop' :'mobile')],
 'extras' :'gpc_id_elemento="'+elemento.attr('id')+'"'
},
 'gm_fundo' :{
 'conteudos' :{'topo' :{'conteudo' :"<div class='gpc_modal_popup-fundo-fechar icone-fechar'></div>"}},
 'classes' :'gpc_modal-fundo',
 'estilos' :'overflow:hidden;',
 'extras' :'gm_fundo_acao="fechar"'
}
};
 
 AbrirGM('gpc_modal_'+gm_quantidade, 'gpc_modal_popup',configuracao);
 
 setTimeout(function(){
 if($('#gpc_modal_'+gm_quantidade+' .'+pagina_controle['classe_elemento']+'.e_slider').length){
 GSlideImage.iniciar();
}
 if($('#gpc_modal_'+gm_quantidade+' .'+pagina_controle['classe_elemento']+'.e_faq').length){
 GAccordion.instalar();
}
 GreatLoader('atualizar');
 GreatFontes(true);
 bindEvents();
},400);
 
 return false;
});
 $('body').on('click','.gpc_modal_popup-topo-fechar, .gpc_modal_popup-fundo-fechar',function(e){FecharGM($('.gpc_modal').last().attr('id'));});
 
 $('body').on('click','.link_interno',function(e){
 if($(this).attr('data-bloco-mobile') !== undefined && $(window).width() < 720){
 var bloco = $(this).attr('data-bloco-mobile');
 if(!$((bloco.substr(0,1) == '#' ? bloco :'#'+bloco)).length){bloco = $(this).attr('data-bloco');}
}else{var bloco = $(this).attr('data-bloco');}
 if(bloco != undefined){
 if($((bloco.substr(0,1) == '#' ? bloco :'#'+bloco)).length){
 var sc = window.gScrollEl ? window.gScrollEl() : null;
 if (sc){
 var bl = $((bloco.substr(0,1) == '#' ? bloco :'#'+bloco))[0];
 var gTopo = (window.gAncoraTopo && window.gAncoraTopo()) || 60;
 var y = sc.scrollTop + (bl.getBoundingClientRect().top - sc.getBoundingClientRect().top) - gTopo;
 window.gScrollSet(y, true);
}else{
 var offset = $((bloco.substr(0,1) == '#' ? bloco :'#'+bloco)).offset();
 var gTopo2 = (window.gAncoraTopo && window.gAncoraTopo()) || 60;
 if ('scrollBehavior' in document.documentElement.style){window.scroll({top:(offset.top-gTopo2), behavior:"smooth"});}
 else{smoothScrollTo(0, (offset.top-gTopo2), 800);}
}
}
}
 return false;
});
 
 $('body').on('click','.link_externo',function(e){
});
 
 
 if(!window.getCrawler()){
 gpages_lgpd_instalar("",".pages.dev.br");
}
});
 
 'use strict';

var gac_timeout ={}, gac_timeout_resize;
function gacCor(el, attr){
 let v = el.getAttribute(attr);
 return (v && v.indexOf('--') === 0) ? 'var(' + v + ')' :v;
}
var GAccordion = function (){
 return{
 instalar:function (id){
 let instancias;
 if (id != undefined){instancias = document.querySelectorAll('#' + id + ' .gac');}
 else{instancias = document.querySelectorAll('.gac');}
 if (instancias){
 for (var i = 0;i < instancias.length;i++){
 id = instancias[i].closest('.gpc-e, .gpc-blocos_bloco_elemento').getAttribute('id');
 let ja_iniciado = false, abrir_primeiro = false;
 if (instancias[i].getAttribute('gac-abrir_primeiro') == 'true'){abrir_primeiro = true;}
 let itens = instancias[i].querySelectorAll('.gac-item_cabecalho');
 if (instancias[i].parentElement.classList.contains('gpc-e')){
 ja_iniciado = instancias[i].classList.contains('gac-ativo');
 instancias[i].classList.add('gac-ativo');
}
 if (itens){
 if (!ja_iniciado){
 for (var x = 0;x < itens.length;x++){
 let atual = itens[x];
 if (document.getElementById(id).classList.contains('gpc-e')){
 itens[x].addEventListener('click', function (){GAccordion.abrir(atual.closest('.gpc-e').getAttribute('id'), atual);}, false);
 GAccordion.hover(atual);
}
 else{
 atual.closest('.gac-item').classList.remove('gac-aberto');
 let conteudo = atual.closest('.gac-item').querySelector('.gac-item_conteudo');
 conteudo.style.height = '';
 if (atual.closest('.gpc-blocos_bloco_elemento')){
 atual.style.color = gacCor(atual.closest('.gac'), 'data-color');
 atual.style.background = gacCor(atual.closest('.gac'), 'data-background-color');
}
}
}
}
 if (instancias[i].closest('.gpc-e')){
 let visivel = getComputedStyle(instancias[i].closest('.gpc-e'));
 if (abrir_primeiro && itens.length && visivel.visibility === 'visible' && visivel.display === 'block'){
 GAccordion.abrir(itens[0].closest('.gpc-e').getAttribute('id'), itens[0], true);
}
}
}
}
}
}, hover:function (cab){
 let gac = cab.closest('.gac');
 if (!gac || gac.getAttribute('data-color-hover') === null){return;}
 let pintar = function (hover){
 let item = cab.closest('.gac-item');
 if (!item || item.classList.contains('gac-aberto')){return;}
 cab.style.color = gacCor(gac, hover ? 'data-color-hover' :'data-color');
 cab.style.background = gacCor(gac, hover ? 'data-background-color-hover' :'data-background-color');
};
 cab.addEventListener('pointerenter', function (){pintar(true);}, false);
 cab.addEventListener('pointerleave', function (){pintar(false);}, false);
 cab.addEventListener('click', function (){pintar(true);}, false);
}, abrir:function (id, item, primeiro){
 if (primeiro == undefined){primeiro = false;}
 let instancia = document.querySelector("#" + id);
 if (instancia){
 if (item.closest('.gac-item').classList.contains('gac-aberto') && !primeiro){GAccordion.fechar(id, item);}
 else{
 let abertos = document.querySelectorAll('.gac-aberto');
 if (abertos && !primeiro){
 for (var i = 0;i < abertos.length;i++){
 if (abertos[i].closest('.gpc-e')){
 if (abertos[i].closest('.gpc-b')){
 if (instancia.closest('.gpc-b') && abertos[i].closest('.gpc-b').getAttribute('id') == instancia.closest('.gpc-b').getAttribute('id')){GAccordion.fechar(abertos[i].closest('.gpc-e').getAttribute('id'), abertos[i]);}
}else if (abertos[i].closest('.gpc_modal')){
 GAccordion.fechar(abertos[i].closest('.gpc-e').getAttribute('id'), abertos[i])
}
}
}
}
 item.closest('.gac-item').classList.add('gac-aberto');
 let conteudo = item.closest('.gac-item').querySelector('.gac-item_conteudo');
 let tamanho_conteudo = conteudo.scrollHeight;
 conteudo.style.height = tamanho_conteudo + 'px';
 if (instancia.closest('.gpc-blocos_bloco_elemento')){
 let itens = instancia.querySelectorAll('.gac-item_cabecalho');
 let ativo = item.closest('.gac-item');
 let conteudoEl = itens[0] ? itens[0].closest('.conteudo') :null;
 let temHoverAttrs = conteudoEl && conteudoEl.getAttribute('data-color-hover') !== null;
 for (var x = 0;x < itens.length;x++){
 let gi = itens[x].closest('.gac-item');
 if (gi === ativo){continue;}
 gi.classList.remove('gac-aberto');
 if (temHoverAttrs){
 gi.querySelector('.gac-item_cabecalho').style.color = gacCor(conteudoEl, 'data-color');
 gi.querySelector('.gac-item_cabecalho').style.background = gacCor(conteudoEl, 'data-background-color');
}
 gi.querySelector('.gac-item_conteudo').style.height = '';
}
 if (temHoverAttrs){
 ativo.querySelector('.gac-item_cabecalho').style.color = gacCor(conteudoEl, 'data-color-hover');
 ativo.querySelector('.gac-item_cabecalho').style.background = gacCor(conteudoEl, 'data-background-color-hover');
 ativo.querySelector('.gac-item_conteudo').style.color = gacCor(conteudoEl, 'data-color-texto');
 ativo.querySelector('.gac-item_conteudo').style.background = gacCor(conteudoEl, 'data-background-color-hover');
}
}
 if ((instancia.closest('.gpc-b') || instancia.closest('.gpc_modal')) && !document.querySelectorAll('#admin_centro').length){
 let elemento = instancia.closest('.gpc-e');
 let rotacao = GAccordion.rotacao(getComputedStyle(elemento)['transform']);
 let dif = GAccordion.calcularAjuste(rotacao, tamanho_conteudo);
 elemento.style.transform = `translate(${dif.deltaX}px, ${dif.deltaY}px) rotate(${rotacao}deg)`;
 if(rotacao != 0){conteudo.style.transition = 'none';}
 else{conteudo.style.transition = '';}
 if (instancia.closest('.gpc-blocos_bloco_elemento')){conteudo.style.height = 'auto';}
 GAccordion.reposicionar(elemento);
}else{
 let elemento = instancia.closest('.gpc-blocos_bloco_elemento');
 let rotacao = GAccordion.rotacao(getComputedStyle(elemento)['transform']);
 let dif = GAccordion.calcularAjuste(rotacao, tamanho_conteudo);
 tamanho_conteudo = tamanho_conteudo + dif.deltaY;
 if(rotacao != 0){conteudo.style.transition = 'none';}
 else{conteudo.style.transition = '';}
 elemento.style.transform = `translate(${dif.deltaX}px, ${dif.deltaY}px) rotate(${rotacao}deg)`;
 
 let elementos, bloco;
 if (instancia.closest('.gpc_modal')){
 elementos = instancia.closest('.gpc_modal').querySelectorAll('.gpc-blocos_bloco_elemento');
 bloco = instancia.closest('.gpc_modal');
}else{
 elementos = instancia.closest('.gpc-blocos_bloco_interno').querySelectorAll('.gpc-blocos_bloco_elemento');
 bloco = instancia.closest('.gpc-blocos_bloco_interno');
}
 if (elementos){
 let total_elementos = elementos.length;
 for (var i = 0;i < total_elementos;i++){
 if (elementos[i].getAttribute('id') != item.closest('.gpc-blocos_bloco_elemento').getAttribute('id')){
 elementos[i].classList.add('gac-movendo');
 if (
 parseFloat(elementos[i].offsetTop) >= (item.closest('.gpc-blocos_bloco_elemento').offsetTop + item.closest('.gpc-blocos_bloco_elemento').offsetHeight) &&
 elementos[i].getAttribute('id') != item.closest('.gpc-blocos_bloco_elemento').getAttribute('id') &&
 elementos[i].offsetParent
 ){elementos[i].style.top = (parseFloat(elementos[i].style.top) + tamanho_conteudo) + 'px';}
}
}
}
 bloco.classList.add('gac-movendo');
 bloco.style.setProperty('height', (parseFloat(bloco.style.height) + tamanho_conteudo) + 'px');
 if (instancia.closest('.gpc_modal')){PosicionarGM(instancia.closest('.gpc_modal').getAttribute('id'), false);}
 for (let i = 0;i < 8;i++){setTimeout(function (){gpc_controle['elementos_iniciados']['elemento'].updateRect();}, 40 * i);}
}
}
}
}, fechar:function (id, item){
 let instancia = document.querySelector("#" + id);
 if (instancia){
 if (gac_timeout.hasOwnProperty(id)){
 clearTimeout(gac_timeout[id]);
 delete gac_timeout[id];
}
 if (instancia.closest('.gpc-blocos_bloco_elemento')){
 let itens = item.closest('.gac').querySelectorAll('.gac-item_cabecalho');
 let gacEl = item.closest('.gac');
 let temHoverAttrs = gacEl && gacEl.getAttribute('data-color-hover') !== null;
 for (var x = 0;x < itens.length;x++){
 itens[x].closest('.gac-item').classList.remove('gac-aberto');
 if (temHoverAttrs){
 itens[x].closest('.gac-item').querySelector('.gac-item_cabecalho').style.color = gacCor(gacEl, 'data-color');
 itens[x].closest('.gac-item').querySelector('.gac-item_cabecalho').style.background = gacCor(gacEl, 'data-background-color');
}
 itens[x].closest('.gac-item').querySelector('.gac-item_conteudo').style.height = '';
}
}
 item.closest('.gac-item').classList.remove('gac-aberto');
 let conteudo = item.closest('.gac-item').querySelector('.gac-item_conteudo');
 conteudo.style.height = '';
 if ((instancia.closest('.gpc-b') || instancia.closest('.gpc_modal')) && !document.querySelectorAll('#admin_centro').length){
 let elemento = instancia.closest('.gpc-e');
 let rotacao = GAccordion.rotacao(getComputedStyle(elemento)['transform']);
 elemento.style.transform = `translate(0px, 0px) rotate(${rotacao}deg)`;
 GAccordion.reposicionar(elemento);
}else{
 let elemento = instancia.closest('.gpc-blocos_bloco_elemento');
 let rotacao = GAccordion.rotacao(getComputedStyle(elemento)['transform']);
 elemento.style.transform = `translate(0px, 0px) rotate(${rotacao}deg)`;
 let versao = '';
 if (document.getElementById('gpc-blocos').classList.contains('mobile')){versao = '_mobile';}
 
 let elementos, bloco;
 if (instancia.closest('.gpc_modal')){
 elementos = instancia.closest('.gpc_modal').querySelectorAll('.gpc-blocos_bloco_elemento');
 bloco = instancia.closest('.gpc_modal');
}else{
 elementos = instancia.closest('.gpc-blocos_bloco_interno').querySelectorAll('.gpc-blocos_bloco_elemento');
 bloco = instancia.closest('.gpc-blocos_bloco_interno');
}
 if (elementos){
 let total_elementos = elementos.length;
 for (var i = 0;i < total_elementos;i++){
 if (
 parseFloat(elementos[i].style.top) >= (parseFloat(instancia.style.top) + parseFloat(getComputedStyle(instancia)['height'])) &&
 elementos[i].getAttribute('id') != id &&
 elementos[i].offsetParent
 ){elementos[i].setAttribute('style', elementos_pagina[elementos[i].getAttribute('gpc_id_elemento')]['estilos' + versao]);}
}
}
 bloco.setAttribute('style', blocos_pagina[bloco.getAttribute('gpc_id_bloco')]['estilos' + versao]);
 if (instancia.closest('.gpc_modal')){PosicionarGM(instancia.closest('.gpc_modal').getAttribute('id'), false);}
 for (let i = 0;i < 8;i++){setTimeout(function (){gpc_controle['elementos_iniciados']['elemento'].updateRect();}, 40 * i);}
}
 
 let elementos = document.querySelectorAll('.gac-movendo');
 if (elementos){for (var i = 0;i < elementos.length;i++){elementos[i].classList.remove('gac-movendo');}}
}
}, resize:function (id){
 if (document.querySelectorAll('#admin_centro').length){return false;}
 let instancias;
 if (id != undefined){instancias = document.querySelectorAll('#' + id + ' .gac');}
 else{instancias = document.querySelectorAll('.gac');}
 if (instancias){
 let acordeoes = [], blocos = [];
 for (var i = 0;i < instancias.length;i++){
 let elemento = instancias[i].closest('.gpc-e');
 let itens = instancias[i].querySelectorAll('.gac-aberto');
 if (!elemento || !itens.length || !(elemento.closest('.gpc-b') || elemento.closest('.gpc_modal'))){continue;}
 for (var x = 0;x < itens.length;x++){itens[x].querySelector('.gac-item_conteudo').style.height = 'auto';}
 if (blocos.indexOf(elemento.closest('.gpc-b, .gpc_modal')) < 0){blocos.push(elemento.closest('.gpc-b, .gpc_modal'));acordeoes.push(elemento);}
}
 for (var i = 0;i < acordeoes.length;i++){GAccordion.reposicionar(acordeoes[i]);}
}
}, reposicionar:function (elemento){
 let bloco = elemento.closest('.gpc-b, .gpc_modal');
 let id_bloco = (elemento.closest('.gpc-b') ? bloco.getAttribute('id') :bloco.getAttribute('gpc_id_elemento'));
 let versao = 'desktop';
 if (window.innerWidth < 800){versao = 'mobile';}
 let elementos = elemento.closest('.centralizar, .gpc_modal').querySelectorAll('.gpc-e');
 let medidas = [], abertos = [];
 for (var i = 0;i < elementos.length;i++){
 let semente = elementos_posicao[elementos[i].getAttribute('id')];
 if (!semente || !elementos[i].offsetParent){elementos[i].style.top = '';continue;}
 let item = elementos[i].querySelector('.gac-aberto');
 let crescimento = 0, pending = 0;
 if (item){
 let content = item.querySelector('.gac-item_conteudo');
 crescimento = content.scrollHeight;
 pending = Math.max(0, crescimento - content.offsetHeight);
 let rotacao = GAccordion.rotacao(getComputedStyle(elementos[i])['transform']);
 if (rotacao == 90 || rotacao == 270){crescimento = 0;}
 else{crescimento = crescimento + GAccordion.calcularAjuste(rotacao, crescimento).deltaY;}
}
 let medida ={elemento:elementos[i], topo:parseFloat(semente[versao]), altura:elementos[i].offsetHeight + pending, crescimento:crescimento, deslocamento:0};
 medidas.push(medida);
 if (item){abertos.push(medida);}
}
 let fimAntes = 0, fimDepois = 0;
 for (var i = 0;i < medidas.length;i++){
 for (var x = 0;x < abertos.length;x++){
 if (abertos[x] != medidas[i] && medidas[i].topo >= (abertos[x].topo + abertos[x].altura - abertos[x].crescimento) && GAccordion.sobrepoeHorizontal(medidas[i].elemento, abertos[x].elemento)){medidas[i].deslocamento = medidas[i].deslocamento + abertos[x].crescimento;}
}
 fimAntes = Math.max(fimAntes, medidas[i].topo + medidas[i].altura - medidas[i].crescimento);
 fimDepois = Math.max(fimDepois, medidas[i].topo + medidas[i].deslocamento + medidas[i].altura);
 medidas[i].elemento.classList.add('gac-movendo');
 medidas[i].elemento.style.top = (medidas[i].deslocamento ? (medidas[i].topo + medidas[i].deslocamento) + 'px' :'');
}
 bloco.classList.add('gac-movendo');
 if (blocos_posicao[id_bloco]){
 if (abertos.length){bloco.style.setProperty('height', (blocos_posicao[id_bloco][versao] + Math.max(0, fimDepois - fimAntes)) + 'px', 'important');}
 else{bloco.style.height = '';}
}
 if (elemento.closest('.gpc_modal')){PosicionarGM(elemento.closest('.gpc_modal').getAttribute('id'), false);}
}, sobrepoeHorizontal:function (a, b){
 return a.offsetLeft < (b.offsetLeft + b.offsetWidth) && b.offsetLeft < (a.offsetLeft + a.offsetWidth);
}, rotacao:function (transform){
 
 const resultados = transform.match(/matrix\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/);
 if (!resultados) return 0;
 
 const a = parseFloat(resultados[1]);
 const b = parseFloat(resultados[2]);
 
 let graus = Math.atan2(b, a) * (180 / Math.PI);
 graus = graus % 360;
 if (graus < 0){graus += 360;}
 
 return parseFloat(graus.toFixed(2));
}, calcularAjuste:function (angulo, tamanhoConteudo){
 // Convertendo o ângulo de rotação para radianos
 let radianos = angulo * Math.PI / 180;
 // Calculando os ajustes baseado na expansão do conteúdo e no ângulo de rotação
 let ajusteX = (Math.sin(radianos) * tamanhoConteudo / 2) * -1;
 let ajusteY = ((1 - Math.cos(radianos)) * tamanhoConteudo / 2) * -1;
 // Retornando os ajustes
 return{deltaX:ajusteX, deltaY:ajusteY};
}

}
}();
window.addEventListener('load', function (){GAccordion.instalar();}, false);
window.addEventListener('resize', function (){
 const elementos = document.querySelectorAll('.gac-movendo');
 if (elementos){for (var i = 0;i < elementos.length;i++){elementos[i].classList.remove('gac-movendo');}}
 if (gac_timeout_resize){clearTimeout(gac_timeout_resize);}
 const largura = window.innerWidth;
 gac_timeout_resize = setTimeout(function (){if (largura == window.innerWidth){GAccordion.resize();}}, 50);
}, false);'use strict';

var carregando = false;

var GLoading = function(){
 return{
 instalar :function(){
 
 var gl = document.querySelector('#gloading');
 if (gl == null || gl == undefined){
 var gl_loading = document.createElement("div");
 gl_loading.id = 'gloading';
 gl_loading.className = 'gloading_esconder';
 gl_loading.innerHTML = '<span></span>';
 document.body.appendChild(gl_loading);
}
},
 carregar :function(configuracao){
 
 if (configuracao.hasOwnProperty('ativar') == false){configuracao.ativar = false;}
 if (configuracao.ativar != true && configuracao.ativar != false){configuracao.ativar = false;}
 if (configuracao.hasOwnProperty('tempo') == false){configuracao.tempo = 0;}
 if (configuracao.hasOwnProperty('tipo') == false){configuracao.tipo = 'barra';}
 if (configuracao.tipo != 'barra' && configuracao.tipo != 'tela'){configuracao.tipo = 'barra';}
 
 var gl = document.querySelector('#gloading');
 
 if (gl != null && gl != undefined){
 
 if (configuracao.ativar == true){GLoading.carregar_mostrar(gl, configuracao);}
 
 if (configuracao.ativar == false || configuracao.tempo != 0){GLoading.carregar_esconder(gl, configuracao);}
}
},
 carregar_mostrar :function(gl, configuracao){
 
 carregando = true;
 
 gl.classList.add('gloading_'+configuracao.tipo+'_carregando');
},
 carregar_esconder :function(gl, configuracao){
 (function(gl, configuracao){
 if(configuracao.tempo > 0){
 setTimeout(function(){
 
 if (gl.classList.contains('gloading_tela_carregando')){gl.classList.remove('gloading_tela_carregando');}
 if (gl.classList.contains('gloading_barra_carregando')){gl.classList.remove('gloading_barra_carregando');}
 
 carregando = false;
}, configuracao.tempo);
}else{
 
 if (gl.classList.contains('gloading_tela_carregando')){gl.classList.remove('gloading_tela_carregando');}
 if (gl.classList.contains('gloading_barra_carregando')){gl.classList.remove('gloading_barra_carregando');}
 
 carregando = false;
}
})(gl, configuracao);
}
};
}();




 $(function(){
 $('body').on('click', '.check .check-borda, .check .check-texto',function(evento){
 
 var check = $(this).closest('.check');
 var check_borda = check.find('.check-borda');
 var campo = check.closest('.admin_campos-campo').find('.admin_campo');
 
 if (!check.hasClass('check_selecionado')){
 
 check.addClass('check_selecionado');
 check_borda.addClass('check-borda_efeito').html("<span class='check-borda-bolinha'></span>");
}else{
 
 check.removeClass('check_selecionado');
 check_borda.html("");
}
 var valores = '', opcoes = check.closest('.checks').find('.check_selecionado');
 if(opcoes.length){
 opcoes.each(function(){valores += $(this).attr('id')+',';});
 valores = valores.substr(0,(valores.length-1));
}
 campo.val(valores).trigger('change');
 ValidacaoCampos(campo);
 setTimeout(function(){check_borda.removeClass('check-borda_efeito');},200);
});
});
'use strict';
var GFM = function(){
 return{
 instalar :function(configuracao){
 
 if (configuracao.hasOwnProperty('elemento') == false){configuracao.elemento = '';}
 if (configuracao.hasOwnProperty('mascara') == false){configuracao.mascara = '';}
 if (configuracao.hasOwnProperty('placeholder') == false){configuracao.placeholder = '';}
 
 var elementos = document.querySelectorAll(configuracao.elemento);
 
 for (var i = 0;i < elementos.length;i++){
 (function(configuracao, elemento){
 
 if (elemento !== undefined && elemento !== null){
 
 if (elemento.dataset.gfm_mascara !== undefined && elemento.dataset.gfm_mascara !== null){configuracao.mascara = elemento.dataset.gfm_mascara;}
 if (elemento.dataset.gfm_placeholder !== undefined && elemento.dataset.gfm_placeholder !== null){configuracao.placeholder = elemento.dataset.gfm_placeholder;}
 
 if (elemento.addEventListener){
 elemento.addEventListener("focusin", function (evento){GFM.campo_focusin(configuracao, elemento, evento);});
 elemento.addEventListener("focusout", function (evento){GFM.campo_focusout(configuracao, elemento, evento);});
 elemento.addEventListener('input', function (evento){GFM.campo_digitar(configuracao, elemento, evento);});
}else if (elemento.attachEvent){
 elemento.attachEvent("onfocusin", function (evento){GFM.campo_focusin(configuracao, elemento, evento);});
 elemento.attachEvent("onfocusout", function (evento){GFM.campo_focusout(configuracao, elemento, evento);});
 elemento.attachEvent('oninput', function (evento){GFM.campo_digitar(configuracao, elemento, evento);});
}
}
})(configuracao, elementos[i]);
}
},
 campo_focusin :function(configuracao, elemento, evento){
 
 if (elemento.placeholder){elemento.dataset.gfm_placeholder_anterior = elemento.placeholder;}
 else{elemento.dataset.gfm_placeholder_anterior = ' ';}
 if (configuracao.placeholder){elemento.placeholder = configuracao.placeholder;}
 
 elemento.maxLength = configuracao.mascara.length;
},
 campo_focusout :function(configuracao, elemento, evento){
 
 if (elemento.value.length < configuracao.mascara.replace('9','').replace('Z','').replace('D','').replace('?','').length){elemento.value = '';}
 
 if (elemento.dataset.gfm_placeholder_anterior){elemento.placeholder = elemento.dataset.gfm_placeholder_anterior;}
},
 campo_digitar :function(configuracao, elemento, evento){
 if (evento.inputType && evento.inputType.indexOf('delete') === 0){return;}
 if (evento.data != null){
 var tecla_codigo = evento.data.charCodeAt(0);
 if (tecla_codigo === 8 || tecla_codigo === 46 || tecla_codigo === 16 || tecla_codigo === 17 || tecla_codigo === 18){return;}
 if (tecla_codigo === 37 || tecla_codigo === 38 || tecla_codigo === 39 || tecla_codigo === 40){return;}
}
 evento.preventDefault();
 evento.stopPropagation();
 var texto = elemento.value;
 var posicionar_cursor = false;
 if (typeof elemento.selectionStart == "number" && typeof elemento.selectionEnd == "number"){
 var selecao_inicio = elemento.selectionStart;
 var selecao_fim = elemento.selectionEnd;
 if (selecao_inicio != selecao_fim || elemento.value.length != selecao_fim){
 posicionar_cursor = true;
}
}
 var texto_tamanho = texto.length;
 var texto_novo = '';
 var caractere = '';
 for (var numero_mascara = 0, numero_texto = 0;numero_mascara < configuracao.mascara.length;++numero_mascara){
 caractere = texto.charAt(numero_texto);
 switch (configuracao.mascara.charAt(numero_mascara)){
 case '0' :
 case '9' :
 if (/\d/.test(caractere)){texto_novo += caractere;}
 ++numero_texto;
 break;
 case 'A' :
 case 'Z' :
 if (/[a-z]/i.test(caractere)){texto_novo += caractere;}
 ++numero_texto;
 break;
 case 'C' :
 case 'D' :
 if (/[a-z0-9]/i.test(caractere)){texto_novo += caractere;}
 ++numero_texto;
 break;
 case 'X' :
 case '?' :
 texto_novo += caractere;
 ++numero_texto;
 break;
 default :
 texto_novo += configuracao.mascara.charAt(numero_mascara);
 if (configuracao.mascara.charAt(numero_mascara) == texto.charAt(numero_mascara)){
 ++numero_texto;
}else{if (posicionar_cursor && numero_texto+1 == selecao_inicio){++selecao_inicio;}}
 break;
}
 if (numero_texto == texto_tamanho){break;}
}
 elemento.value = texto_novo;
 if (posicionar_cursor && elemento.setSelectionRange){elemento.setSelectionRange(selecao_inicio, selecao_inicio);}
}
};
}();


 
 var gm_quantidade = 0;
 function AbrirGM(id_gm, componente, configuracao){
 
 var z_index_fundo = 999, z_index_caixa = 1000;
 if($('#gpc-menu').length){
 z_index_fundo = 999999999999902;
 z_index_caixa = 999999999999903;
}
 var gm_conteudos = '';
 if (configuracao['gm']['conteudos']){$.each(configuracao['gm']['conteudos'], function (classe, div){if (div.conteudo){gm_conteudos += "<div class='"+componente+"-"+classe+"' "+div.extras+" style='"+div.estilos+"'>"+div.conteudo+"</div>";}});}
 var gm_fundo_conteudos = '';
 if (configuracao['gm']['conteudos']){$.each(configuracao['gm_fundo']['conteudos'], function (classe, div){if (div.conteudo){gm_fundo_conteudos += "<div class='"+componente+"_fundo-"+classe+"' "+div.extras+" style='"+div.estilos+"'>"+div.conteudo+"</div>";}});}
 var scroll = (window.gScrollTop ? window.gScrollTop() : window.scrollY);
 var tela_altura = $(window).height();
 if(componente == 'gpc_modal' && $('#gpc-blocos_editor').length){
 scroll = (document.getElementById("gpc-blocos").scrollTop-$('#gpc-blocos').offset().top);
 tela_altura = $('#gpc-blocos_editor').height();
}
 
 if(componente == 'gpc_modal' && $('#gpc-blocos_editor').length){$('#gpc-blocos_editor').append("<div gm_id='"+id_gm+"' gm_componente='"+componente+"' class='gm_fundo "+id_gm+" "+configuracao['gm_fundo']['classes']+"' "+configuracao['gm_fundo']['extras']+" style='z-index:"+(z_index_fundo+gm_quantidade)+";"+configuracao['gm_fundo']['estilos']+"'>"+gm_fundo_conteudos+"</div>");}
 else{$("body").append("<div gm_id='"+id_gm+"' gm_componente='"+componente+"' class='gm_fundo "+id_gm+" "+configuracao['gm_fundo']['classes']+"' "+configuracao['gm_fundo']['extras']+" style='z-index:"+(z_index_fundo+gm_quantidade)+";"+configuracao['gm_fundo']['estilos']+"'>"+gm_fundo_conteudos+"</div>");}
 
 $("."+id_gm).addClass('gm_fundo_ativo');
 if(!$(".gm").length || $('.gpc_modal').lenght){
 
 if(componente == 'gpc_modal' && $('#gpc-blocos_editor').length){$('#gpc-blocos_editor').addClass('body_bloquear');}
 else{
 if(componente == 'gpc_modal_popup'){$("body").addClass('body_bloquear_site');}
 else{
 $("body").addClass('body_bloquear');
 if(componente == 'gpc_modal_imagens'){$("body").css({'overflow':'hidden'});}
}
}
 
 if($('#site').length && componente != 'gma_modal'){$('#site').addClass('site_borrar').css({'top':-scroll+'px','height':($('#site').height()+scroll)+''});}
 else if(componente == 'gpc_modal' && $('#gpc-blocos_editor').length){$('#gpc-blocos_editor-blocos').addClass('administrador_borrar').css({'top':-(scroll)+'px'});}
 else{$('#administrador').addClass('administrador_borrar').css({'top':-scroll+'px'});}
}
 
 if(componente == 'gpc_modal' && $('#gpc-blocos_editor').length){$('#gpc-blocos_editor').append("<div id='"+id_gm+"' gm_componente='"+componente+"' gm_scroll='"+scroll+"' class='gm "+configuracao['gm']['classes']+"' "+configuracao['gm']['extras']+" style='z-index:"+(z_index_caixa+gm_quantidade)+";top:"+tela_altura+"px;"+configuracao['gm']['estilos']+"'>"+gm_conteudos+"</div>");}
 else if(componente == 'gma_modal'){$("body").append("<div id='"+id_gm+"' gm_componente='"+componente+"' gm_scroll='"+scroll+"' class='gm gm_efeitos "+configuracao['gm']['classes']+"' "+configuracao['gm']['extras']+" style='z-index:"+(z_index_caixa+gm_quantidade)+";top:"+((tela_altura/100)*5)+"px;"+configuracao['gm']['estilos']+"'>"+gm_conteudos+"</div>");}
 else if(componente == 'gpc_modal_popup'){$("body").append("<div id='"+id_gm+"' gm_componente='"+componente+"' gm_scroll='"+scroll+"' class='gm gm_esconder "+configuracao['gm']['classes']+"' "+configuracao['gm']['extras']+" style='z-index:"+(z_index_caixa+gm_quantidade)+";top:"+(tela_altura+scroll)+"px;"+configuracao['gm']['estilos']+"'>"+gm_conteudos+"</div>");}
 else{$("body").append("<div id='"+id_gm+"' gm_componente='"+componente+"' gm_scroll='"+scroll+"' class='gm gm_esconder "+configuracao['gm']['classes']+"' "+configuracao['gm']['extras']+" style='z-index:"+(z_index_caixa+gm_quantidade)+";top:"+tela_altura+"px;"+configuracao['gm']['estilos']+"'>"+gm_conteudos+"</div>");}
 
 if(componente == 'gma_modal'){
 setTimeout(function(){
 $('#'+id_gm).css('opacity', '1');
 PosicionarGM(id_gm);
},250);
}else{setTimeout(function(){PosicionarGM(id_gm);},150);}
 
 window.addEventListener('resize', function(event){
 if(componente != 'gpc_modal'){
 if (componente == 'gmi'){PosicionarGM(id_gm, false);}
 else{PosicionarGM(id_gm);}
}
});
}
 function PosicionarGM(id_gm, efeitos){
 
 if(efeitos === undefined || efeitos === ''){efeitos = true;}
 
 var gm = $("#"+id_gm);
 if (gm.length){
 
 var tela_altura = $(window).height();
 var tela_largura = $(window).width();
 var tela = (window.gScrollTop ? window.gScrollTop() : window.scrollY);
 if($('.gm').length > 1){tela = 0;}
 
 if (gm.attr('gm_componente') == 'gpc_modal'){
 tela = document.getElementById("gpc-blocos").scrollTop;
 tela_altura = $('#gpc-blocos_editor').height();
 gm.find('.gpc_modal-centro').removeAttr('style');
 var gm_fundo = $("."+id_gm);
 var height = 20;
 $('.'+gpc_controle['classe_bloco']).each(function(){height += $(this).height();});
 gm_fundo.css({'height':height+'px'});
}
 if (gm.attr('gm_componente') == 'gpc_modal_formulario'){gm.find('.gpc_modal_formulario-centro').removeAttr('style');}
 if (gm.attr('gm_componente') == 'gml'){gm.find('.gml-centro').removeAttr('style');}
 if (gm.attr('gm_componente') == 'gmf'){gm.find('.gmf-centro').removeAttr('style');}
 if (gm.attr('gm_componente') == 'gm_configurar_dns_completo'){gm.find('.gm_configurar_dns_completo-centro').removeAttr('style');}
 if (gm.attr('gm_componente') == 'guo'){gm.find('.guo-passos').removeAttr('style');}
 if (gm.attr('gm_componente') == 'gsp'){gm.find('.gmf-opcoes').removeAttr('style');}
 if (gm.attr('gm_componente') == 'gpc_modal_imagens'){gm.find('.gpc_modal_imagens-centro, .gpc_modal_imagens-centro-pastas, .gpc_modal_imagens-centro-fotos').removeAttr('style');}
 if (gm.attr('gm_componente') == 'gmi'){
 
 var imagem = CalcularGMI(gmi_elemento['elemento']);
 
 if (gmi_caixa['elemento']){
 
 gmi_caixa['elemento'].css({'width':imagem['largura']+'px', 'height':imagem['altura']+'px'});
 
 gmi_caixa_imagem['elemento'].css({'width':imagem['largura']+'px', 'height':imagem['altura']+'px'});
}
}
 if (gm.attr('gm_componente') == 'gmi_informacoes'){gm.find('.gmi_informacoes-centro').removeAttr('style');}
 if (gm.attr('gm_componente') == 'gmi_comentarios'){gm.find('.gmi_comentarios-centro').css('height','100%');}
 
 var gm_largura = gm.width();
 
 var gm_altura = 0;
 if (gm.attr('gm_componente') == 'gpc_modal_imagens' || gm.attr('gm_componente') == 'gml'){gm_altura = tela_altura;
}else if (gm.attr('gm_componente') == 'gpc_modal_popup' || gm.attr('gm_componente') == 'gpc_modal'){
 if(gm.attr('gm_componente') == 'gpc_modal_popup'){tela = 0;}
 gm_altura = $('.gpc_modal').height();
 var gm_fundo = $("."+id_gm);
 var height = 20;
 if (gm.attr('gm_componente') == 'gpc_modal_popup'){
 gm_altura = $('.gpc_modal_popup-centro').height();
 $('.gpc-b').each(function(){height += $(this).height();});
}else{$('.'+gpc_controle['classe_bloco']).each(function(){height += $(this).height();});}
 if (gm_altura >= tela_altura){
 $('#site').css({'height':(gm_altura+Math.abs(parseFloat($('#site').css('top')))+70)+'px'});
 gm_fundo.css({'height':(gm_altura+70)+'px'});
}else{
 $('#site').css({'height':(tela_altura+Math.abs(parseFloat($('#site').css('top'))))+'px'});
 if(gm_altura+20 >= (gm_fundo.height()-10)){gm_fundo.css({'height':(tela_altura+10)+'px'});}
 else{gm_fundo.css({'height':tela_altura+'px'});}
}
}else if (gm.attr('gm_componente') == 'gpc_modal_formulario'){gm_altura = $('.gpc_modal_formulario').height();
}else if (gm.attr('gm_componente') == 'gma_modal'){gm_altura = $('#gm-gpages_modal').height();
}else{gm.children().each(function(){gm_altura += $(this).outerHeight(true);});}
 if (gm_altura >= tela_altura){
 if (gm.attr('gm_componente') == 'gpc_modal_formulario'){gm.find('.gpc_modal_formulario-centro').css({'height':$('.gpc_modal_formulario').height()+'px'});}
 if (gm.attr('gm_componente') == 'gpc_modal'){gm.find('.gpc_modal-centro').css({'height':$('.gpc_modal').height()+'px'});}
 if (gm.attr('gm_componente') == 'gpc_modal_popup'){gm.find('.gpc_modal_popup-centro').css({'height':$('.gpc_modal_popup').height()+'px'});}
 if (gm.attr('gm_componente') == 'gml'){
 
 tela += 20;
 gm.find('.gml-centro, .gml-opcoes-lista-lateral, .gml-opcoes-lista-opcoes').css({'height':((tela_altura-(gm.find('.gml-topo').outerHeight()))-50)+'px'});
}
 if (gm.attr('gm_componente') == 'gmf'){gm.find('.gmf-centro').css({'height':((tela_altura-((gm.find('.gmf-topo').outerHeight())+(gm.find('.gmf-rodape').outerHeight())))-20)+'px'});}
 if (gm.attr('gm_componente') == 'gm_configurar_dns_completo'){gm.find('.gm_configurar_dns_completo-centro').css({'height':((tela_altura-((gm.find('.gm_configurar_dns_completo-topo').outerHeight())+(gm.find('.gm_configurar_dns_completo-rodape').outerHeight())))-20)+'px'});}
 if (gm.attr('gm_componente') == 'gpc_modal_imagens'){
 tela += 50;
 gm.find('.gpc_modal_imagens-centro, .gpc_modal_imagens-centro-pastas, .gpc_modal_imagens-centro-fotos').css({'height':((tela_altura-(gm.find('.gpc_modal_imagens-topo').outerHeight()))-120)+'px'});
}
 if (gm.attr('gm_componente') == 'guo'){gm.find('.guo-passos').css({'height':(gm_altura-(gm_altura-tela_altura)-96)+'px'});}
 if (gm.attr('gm_componente') == 'gsp'){gm.find('.gsp-opcoes').css({'height':((tela_altura-((gm.find('.gsp-topo').outerHeight())+(gm.find('.gsp-rodape').outerHeight())))-20)+'px'});}
 if (gm.attr('gm_componente') == 'gmi_informacoes'){gm.find('.gmi_informacoes-centro').css({'height':((tela_altura-((gm.find('.gmi_informacoes-topo').outerHeight())))-20)+'px'});}
 if (gm.attr('gm_componente') == 'gmi_comentarios'){gm.find('.gmi_comentarios-centro').css({'height':((tela_altura-((gm.find('.gmi_comentarios-topo').outerHeight())+(gm.find('.gmi_comentarios-rodape').outerHeight())))-20)+'px'});}
 
 if (efeitos){
 if (!gm.hasClass('gm_efeitos')){gm.addClass('gm_efeitos');}
}else{
 if (gm.hasClass('gm_efeitos')){gm.removeClass('gm_efeitos');}
}
 
 if(gm.attr('gm_componente') == 'gpc_modal_popup'){
 setTimeout(function(){
 gm.css({'top':(tela+10)+'px'}).removeClass('gm_esconder');
 $('.'+id_gm).css({'overflow':''});
},25);
}else if (gm.attr('gm_componente') == 'gma_modal'){setTimeout(function(){gm.css({'top':(tela)+'px'}).removeClass('gm_esconder');},25);}
 else{
 setTimeout(function(){
 gm.css({'top':(tela+10)+'px'}).removeClass('gm_esconder');
 if(gm.attr('gm_componente') == 'gpc_modal' && typeof gpc_controle['elementos_iniciados'][id_gm] == 'object'){
 
 if(Object.keys(gpc_controle['elementos_iniciados']).length){
 $.each(gpc_controle['elementos_iniciados'], function (i, elemento_iniciado){
 if(typeof gpc_controle['elementos_iniciados'][i].updateRect == 'function'){gpc_controle['elementos_iniciados'][i].updateRect();}
});
}
}
},25);
}
}else{
 if (gm.attr('gm_componente') == 'gpc_modal_imagens'){gm.find('.gpc_modal_imagens-centro, .gpc_modal_imagens-centro-pastas, .gpc_modal_imagens-centro-fotos').css({'height':((gm_altura-(gm.find('.gpc_modal_imagens-topo').outerHeight()))-120)+'px'});}
 if (gm.attr('gm_componente') == 'gml'){gm.find('.gml-centro, .gml-opcoes-lista-lateral, .gml-opcoes-lista-opcoes').css({'height':((tela_altura-(gm.find('.gml-topo').outerHeight()))-50)+'px'});}
 
 if (efeitos){if (!gm.hasClass('gm_efeitos')){gm.addClass('gm_efeitos');}}else{if (gm.hasClass('gm_efeitos')){gm.removeClass('gm_efeitos');}}
 
 if(gm.attr('gm_componente') == 'gpc_modal_popup'){
 setTimeout(function(){
 gm.css({'top':(((tela_altura-gm_altura)/2)+tela)+'px','bottom':'initial'}).removeClass('gm_esconder');
 $('.'+id_gm).css({'overflow':''});
},25);
}else{
 setTimeout(function(){
 gm.css({'top':(((tela_altura-gm_altura)/2)+tela)+'px','bottom':'initial'}).removeClass('gm_esconder');
 if(gm.attr('gm_componente') == 'gpc_modal' && typeof gpc_controle['elementos_iniciados'][id_gm] == 'object'){gpc_controle['elementos_iniciados'][id_gm].updateRect();}
},25);
}
}
}
}
 function FecharGM(id_gm){
 var gm = $("#"+id_gm);
 if (gm.length){
 var componente = gm.attr('gm_componente');
 if(componente == 'gpc_modal_formulario'){MostrarPreview(false);}
 if(gm.attr('id') == 'gm-plano_alteracao_pagamento' || gm.attr('id') == 'gm-plano_alteracao' || gm.attr('id') == 'gm-plano_contratou'){
 editou = false;
 editou_caixa = false;
 GLoading.carregar({'ativar':false});
 document.location.reload();
}
 if(gm.attr('gm_componente') == 'gpc_modal' && typeof gpc_controle['elementos_iniciados'][id_gm] == 'object'){
 gpc_controle['elementos_iniciados'][id_gm].destroy();
 delete gpc_controle['elementos_iniciados'][id_gm];
}
 
 var gm_fundo = $("."+id_gm);
 var tela = (window.gScrollTop ? window.gScrollTop() : window.scrollY);
 var tela_altura = $(window).height();
 if (componente == 'gpc_modal'){
 tela_largura = $('#gpc-blocos_editor').width();
 tela = document.getElementById("gpc-blocos").scrollTop;
}
 
 if (!gm.hasClass('gm_efeitos')){gm.addClass('gm_efeitos');}
 
 if(componente == 'gma_modal'){gm.css({'opacity':'0'});}
 else{gm.css({'top':(tela_altura+tela)+'px'});}
 
 setTimeout(function(){gm_fundo.removeClass('gm_fundo_ativo');},100);
 
 setTimeout(function(){
 
 if($('.gm_fundo').length == 1){
 if (componente == 'gpc_modal'){
 $('.'+gpc_controle['classe_elemento_adicionar']+'[gpc_tipo="bloco"]').removeClass('esconder');
 var elemento_original = $('.gpc_modal').attr('gpc_id_elemento');
 if(gpc_controle['elementos_selecionados']['elementos_resize'] != ''){
 gpc_controle['elementos_selecionados'] ={'elementos':{}, 'elementos_resize':'', 'total' :0,'helper':{'largura':0,'altura':0,'left_original':'','top_original':'','elemento_left_original':'','elemento_top_original':'','scrollTop':$("#gpc-blocos").offset().top,'scrollLeft':$("#gpc-blocos").scrollLeft()}};
 $('#'+gpc_controle['classe_elementos_selecionados']).remove();
 $('.ui-selected').removeClass('ui-selected');
}
 setTimeout(function(){
 $('#elementos_'+elemento_original).addClass('ativo').trigger('click');
 gpc_controle['elementos_iniciados']['elemento']['target'] = $('#elementos_'+elemento_original)[0];
 gpc_controle['elementos_iniciados']['elemento'].updateRect();
 gpc_controle['elementos_iniciados']['elemento'].selfElement.style.opacity = 1;
},300);
 $('#gpc-blocos_editor-blocos').removeClass('administrador_borrar').removeAttr('style');
 $('.'+gpc_controle['classe_bloco_configurar']).remove();
}else if ($('#site').length){
 if($('#site').closest('.gmf').length){$('#administrador').removeClass('administrador_borrar').removeAttr('style');}
 else{$('#site').removeClass('site_borrar').removeAttr('style');}
}else{$('#administrador').removeClass('administrador_borrar').removeAttr('style');}
}
 
 if($('.gm_fundo').length == 1){
 if (componente == 'gpc_modal'){$('#gpc-blocos_editor').removeClass('body_bloquear');}
 else{$('body').removeClass('body_bloquear body_bloquear_site');}
}
 
 if($('.gm_fundo').length == 1){
 if(componente == 'gpc_modal'){document.getElementById("gpc-blocos").scrollTop = parseFloat(gm.attr('gm_scroll'))+$('#gpc-blocos').offset().top;}
 else if(window.gScrollSet){window.gScrollSet(parseFloat(gm.attr('gm_scroll'))||0, false);}
 else{window.scroll({top:gm.attr('gm_scroll'), behavior:"auto"});}
}
 
 gm.remove();gm_fundo.remove();
 editou = false;
 editou_caixa = false;
 GLoading.carregar({'ativar':false});
 if(componente == 'gpc_modal_imagens'){$("body").css({'overflow':''});}
 if(componente == 'gpc_modal'){
 ElementosBind('todos','reiniciar');
 setTimeout(function(){
 if(typeof gpc_controle['elementos_iniciados']['elemento'] == 'object'){
 
 if(Object.keys(gpc_controle['elementos_iniciados']).length){
 $.each(gpc_controle['elementos_iniciados'], function (i, elemento_iniciado){
 if(typeof gpc_controle['elementos_iniciados'][i].updateRect == 'function'){gpc_controle['elementos_iniciados'][i].updateRect();}
});
}
}
},25);
}
},200);
}
}
 function PulsarGM(id_gm){
 $('#'+id_gm).addClass('gm_pulsar');
 setTimeout(function(){$('#'+id_gm).removeClass('gm_pulsar');},100);
}
 $(function(){
 $('body').on('click','.gm_fundo',function(){if ($(this).attr('gm_fundo_acao') == 'pulsar'){PulsarGM($(this).attr('gm_id'));}else if ($(this).attr('gm_fundo_acao') == 'fechar'){FecharGM($(this).attr('gm_id'));}});
 $('body').on('click','.gm_fechar',function(){FecharGM($(this).attr('gm_id'));});
});
'use strict';

var GModalApproval = function(){
 var _handlerBotaoEditar = null;
 var _handlerBotaoConfigurar = null;
 var _handlerBotaoConfirmar = null;
 var _handlerBotaoRejeitar = null;
 var _handlerBotaoFechar = null;
 var _idModal = null;
 
 var _traducoes ={
 'pt' :{
 'aceitar' :'Entendi e aceito',
 'aceitar_aviso' :'Ok, entendi',
 'rejeitar' :'Rejeitar',
 'configurar' :'Configurar',
 'preferencias' :'Preferências de cookies',
 'modal_titulo' :'Configurações de cookies',
 'modal_texto' :'Você pode escolher quais cookies quer aceitar',
 'modal_confirmar' :'Confirmar configurações',
 'politica' :'Ao navegar nesse site, você está ciente do nosso {link}.',
 'politica_link' :'Aviso de Privacidade',
 'opcoes' :{
 'o' :{'titulo':'Cookies obrigatórios', 'texto':'Eles são cookies para garantir o funcionamento adequado do site.', 'aviso':'Sempre ativo'},
 'e' :{'titulo':'Cookies de estatísticas', 'texto':'São usados para coletar informações para exibir conteúdos específicos para um navegador em particular ao criar diferentes grupos-alvo.'},
 'm' :{'titulo':'Cookies de marketing', 'texto':'Eles são usados para coletar informações para exibir publicidade ou conteúdos específicos para um navegador em particular ao criar diferentes grupos-alvo.'}
}
},
 'en' :{
 'aceitar' :'I understand and accept',
 'aceitar_aviso' :'Ok, got it',
 'rejeitar' :'Reject',
 'configurar' :'Customize',
 'preferencias' :'Cookie preferences',
 'modal_titulo' :'Cookie settings',
 'modal_texto' :'You can choose which cookies you want to accept',
 'modal_confirmar' :'Confirm settings',
 'politica' :'By browsing this site, you acknowledge our {link}.',
 'politica_link' :'Privacy Notice',
 'opcoes' :{
 'o' :{'titulo':'Required cookies', 'texto':'These cookies ensure the proper functioning of the site.', 'aviso':'Always active'},
 'e' :{'titulo':'Statistics cookies', 'texto':'They are used to collect information to display specific content for a particular browser by creating different target groups.'},
 'm' :{'titulo':'Marketing cookies', 'texto':'They are used to collect information to display advertising or specific content for a particular browser by creating different target groups.'}
}
},
 'es' :{
 'aceitar' :'Entiendo y acepto',
 'aceitar_aviso' :'Ok, entendido',
 'rejeitar' :'Rechazar',
 'configurar' :'Configurar',
 'preferencias' :'Preferencias de cookies',
 'modal_titulo' :'Configuración de cookies',
 'modal_texto' :'Puedes elegir qué cookies quieres aceptar',
 'modal_confirmar' :'Confirmar configuración',
 'politica' :'Al navegar por este sitio, usted acepta nuestro {link}.',
 'politica_link' :'Aviso de Privacidad',
 'opcoes' :{
 'o' :{'titulo':'Cookies obligatorias', 'texto':'Son cookies que garantizan el funcionamiento adecuado del sitio.', 'aviso':'Siempre activo'},
 'e' :{'titulo':'Cookies de estadísticas', 'texto':'Se utilizan para recopilar información y mostrar contenidos específicos para un navegador en particular al crear diferentes grupos objetivo.'},
 'm' :{'titulo':'Cookies de marketing', 'texto':'Se utilizan para recopilar información y mostrar publicidad o contenidos específicos para un navegador en particular al crear diferentes grupos objetivo.'}
}
}
};
 
 var _idioma = (navigator.language || navigator.userLanguage || 'en').toLowerCase().substr(0,2);
 var _t = _traducoes[_idioma] || _traducoes['en'];
 return{
 
 instalar :function(configuracao){
 
 if (configuracao.hasOwnProperty('barra') == false){configuracao.barra = '';}
 
 if (configuracao.barra != ''){
 
 if(GModalApproval.preferencias() == null){GModalApproval.barra(configuracao);}
 else{
 GModalApproval.botao(configuracao);
 GModalApproval.instalar_scripts(configuracao,false);
}
 
 setTimeout(function(){GModalApproval.posicionar();}, 500);
}
},
 
 barra :function(configuracao){
 
 if (configuracao.barra.hasOwnProperty('fechar') == false){configuracao.barra.fechar = false;}
 if (configuracao.barra.hasOwnProperty('cor') == false){configuracao.barra.cor = 'ffffff';}
 if (configuracao.barra.hasOwnProperty('classe') == false){configuracao.barra.classe = '';}
 if (configuracao.barra.hasOwnProperty('texto') == false){configuracao.barra.texto = '';}
 
 var consentimento = configuracao.barra.tipo == 2;
 
 var texto = configuracao.barra.texto;
 if(configuracao.barra.politica){
 var ultimo = texto.substr(texto.length-1);
 var link = '<a href="'+configuracao.barra.politica+'" title="'+_t.politica_link+'" target="_blank" class="link_externo">'+_t.politica_link+'</a>';
 texto += (ultimo != '.' && ultimo != '-' ? '.' :'')+'&nbsp;'+_t.politica.replace('{link}', link);
}
 
 var barra = '<div id="gpc-lgpd_texto">'+texto+'</div>';
 barra += '<div id="gpc-lgpd_botoes">';
 if(consentimento){
 barra += '<div id="gpc-lgpd_botoes-configurar" class="gpc-lgpd_botoes-botao">'+_t.configurar+'</div>';
 barra += '<div id="gpc-lgpd_botoes-rejeitar" class="gpc-lgpd_botoes-botao">'+_t.rejeitar+'</div>';
}
 barra += '<div id="gpc-lgpd_botoes-confirmar" class="gpc-lgpd_botoes-botao">'+(consentimento ? _t.aceitar :_t.aceitar_aviso)+'</div>';
 barra += "</div>";
 if(configuracao.barra.fechar){barra += '<div id="gpc-lgpd_fechar"></div>';}
 
 var g_lgpd = document.createElement("div");
 g_lgpd.id = 'gpc-lgpd';
 g_lgpd.className = 'posicionar gpc-lgpd-cor_'+configuracao.barra.cor+' '+(consentimento ? 'botoes' :'botao')+' '+configuracao.barra.classe;
 g_lgpd.innerHTML = barra;
 document.body.appendChild(g_lgpd);
 setTimeout(function(){GModalApproval.configurar(configuracao);}, 300);
},
 botao :function(configuracao){
 
 if(configuracao.barra.hasOwnProperty('editar_consentimento') == false){configuracao.barra.editar_consentimento = true;}
 if(configuracao.barra.editar_consentimento){
 var g_lgpd = document.getElementById("gpc-lgpd_editar");
 if(g_lgpd == null){
 
 g_lgpd = document.createElement("div");
 g_lgpd.id = 'gpc-lgpd_editar';
 g_lgpd.className = 'posicionar gtt-direita gpc-lgpd-cor_'+configuracao.barra.cor+' '+configuracao.barra.classe;
 g_lgpd.setAttribute('data-gtt',_t.preferencias);
 document.body.appendChild(g_lgpd);
 GTooltip.instalar({'elemento' :'.gtt-direita', 'direcao' :'direita'});
 
 setTimeout(function(){GModalApproval.configurar(configuracao);}, 300);
}
}
 
 setTimeout(function(){GModalApproval.posicionar();}, 200);
},
 modal :function(configuracao){
 
 if(document.getElementsByClassName('gm_lgpd').length){return;}
 
 GLoading.carregar({'ativar':true});
 
 var conteudo = '';
 if (configuracao.hasOwnProperty('opcoes') == false){configuracao.opcoes = '';}
 
 conteudo += '<div id="gpc_modal_lgpd-titulo">';
 conteudo += '<div class="gpc_modal_lgpd-titulo-titulo">'+_t.modal_titulo+'</div>';
 conteudo += '<div class="gpc_modal_lgpd-titulo-texto">'+_t.modal_texto+'</div>';
 conteudo += '</div>';
 if(configuracao.opcoes != ''){
 var cookie = GModalApproval.preferencias() || 'o:1&e:0&m:0';
 for (var i = 0;i < configuracao.opcoes.length;i++){
 var opcao = _t.opcoes[configuracao.opcoes[i].id] || {'titulo':'', 'texto':''};
 conteudo += '<div class="gpc_modal_lgpd-opcoes">';
 conteudo += '<div class="gpc_modal_lgpd-opcoes-protecao">';
 conteudo += '<span class="gpc_modal_lgpd-opcoes-titulo">'+opcao.titulo+'</span>';
 if(opcao.aviso){conteudo += '<span class="gpc_modal_lgpd-opcoes-aviso">'+opcao.aviso+'</span>';}
 else{
 if(cookie){configuracao.opcoes[i].valor = (cookie.indexOf(configuracao.opcoes[i].id+':1') !== -1 ? true :false);}
 conteudo += '<span id="'+configuracao.opcoes[i].id+'" class="gpc_modal_lgpd-opcoes-selecao'+(configuracao.opcoes[i].valor ? ' gpc_modal_lgpd-opcoes-selecao_selecionado' :'')+'"><span class="marcador"></span></span>';
}
 conteudo += '</div>';
 conteudo += '<div class="gpc_modal_lgpd-opcoes-texto">'+opcao.texto+'</div>';
 conteudo += '</div>';
}
}
 conteudo += '<div id="gpc_modal_lgpd-confirmar">'+_t.modal_confirmar+'</div>';
 
 var modal ={
 'gm' :{
 'conteudos' :{
 'topo' :{'conteudo' :"<div id='gpc_modal_popup_lgpd-topo-fechar' class='gpc_modal_popup_lgpd-topo-fechar gpc_modal_popup-fechar icone-fechar'></div>", 'estilos' :'', 'extras' :''},
 'centro' :{'conteudo' :conteudo, 'estilos' :'', 'extras' :''}
},
 'classes' :'gm_lgpd',
 'estilos' :'max-width:420px;',
 'extras' :''
},
 'gm_fundo' :{
 'conteudos' :{'topo' :{'conteudo' :"<div id='gpc_modal_popup-fundo-fechar' class='gpc_modal_popup-fundo-fechar gpc_modal_popup-fechar icone-fechar'></div>"}},
 'classes' :'gpc_modal_lgpd-fundo',
 'estilos' :'overflow:hidden;',
 'extras' :'gm_fundo_acao="fechar" id="gpc_modal_lgpd-fundo"'
}
};
 
 gm_quantidade++;
 _idModal = 'gpc_modal_lgpd_'+gm_quantidade;
 AbrirGM(_idModal, 'gpc_modal_popup_lgpd',modal);
 
 GLoading.carregar({'ativar':false});
 var lgpd = document.getElementById("gpc-lgpd");
 if(lgpd == null){lgpd = document.getElementById("gpc-lgpd_editar");}
 lgpd.classList.add('posicionar');
 lgpd.classList.remove('posicionado');
 setTimeout(function(){
 
 var botao_confirmar = document.getElementById("gpc_modal_lgpd-confirmar");
 if(botao_confirmar != null){botao_confirmar.addEventListener("click", function(){GModalApproval.confirmar(configuracao);});}
 var fechar1 = document.getElementById("gpc_modal_popup_lgpd-topo-fechar");
 if(fechar1 != null){
 fechar1.addEventListener("click", function(){
 FecharGM(_idModal);
 GModalApproval.posicionar();
});
}
 var fechar2 = document.getElementById("gpc_modal_popup-fundo-fechar");
 if(fechar2 != null){fechar2.addEventListener("click", function(){GModalApproval.posicionar();});}
 var fechar3 = document.getElementById("gpc_modal_lgpd-fundo");
 if(fechar3 != null){fechar3.addEventListener("click", function(){GModalApproval.posicionar();});}
 var opcoes = document.getElementsByClassName('gpc_modal_lgpd-opcoes-selecao');
 if(opcoes != null){
 for (var i = 0;i < opcoes.length;i++){
 opcoes[i].addEventListener("click", function(e){
 if(this.classList.contains('gpc_modal_lgpd-opcoes-selecao_selecionado')){this.classList.remove('gpc_modal_lgpd-opcoes-selecao_selecionado');}
 else{this.classList.add('gpc_modal_lgpd-opcoes-selecao_selecionado');}
});
}
}
},400);
},
 posicionar :function(){
 var g_lgpd = document.getElementById("gpc-lgpd");
 if(g_lgpd == null){g_lgpd = document.getElementById("gpc-lgpd_editar");}
 if(g_lgpd){
 g_lgpd.classList.add('posicionado');
 g_lgpd.classList.remove('posicionar');
}
},
 
 configurar :function(configuracao){
 
 var botao_editar = document.getElementById("gpc-lgpd_editar");
 if(botao_editar){
 if(_handlerBotaoEditar){botao_editar.removeEventListener("click", _handlerBotaoEditar);}
 _handlerBotaoEditar = function(){GModalApproval.modal(configuracao);};
 botao_editar.addEventListener("click", _handlerBotaoEditar);
}
 
 var botao_configurar = document.getElementById("gpc-lgpd_botoes-configurar");
 if(botao_configurar){
 if(_handlerBotaoConfigurar){botao_configurar.removeEventListener("click", _handlerBotaoConfigurar);}
 _handlerBotaoConfigurar = function(){GModalApproval.modal(configuracao);};
 botao_configurar.addEventListener("click", _handlerBotaoConfigurar);
}
 
 var botao_confirmar = document.getElementById("gpc-lgpd_botoes-confirmar");
 if(botao_confirmar){
 if(_handlerBotaoConfirmar){botao_confirmar.removeEventListener("click", _handlerBotaoConfirmar);}
 _handlerBotaoConfirmar = function(){GModalApproval.confirmarTodos(configuracao);};
 botao_confirmar.addEventListener("click", _handlerBotaoConfirmar);
}
 
 var botao_rejeitar = document.getElementById("gpc-lgpd_botoes-rejeitar");
 if(botao_rejeitar){
 if(_handlerBotaoRejeitar){botao_rejeitar.removeEventListener("click", _handlerBotaoRejeitar);}
 _handlerBotaoRejeitar = function(){GModalApproval.cancelarTodos(configuracao);};
 botao_rejeitar.addEventListener("click", _handlerBotaoRejeitar);
}
 
 var botao_fechar = document.getElementById("gpc-lgpd_fechar");
 if(botao_fechar){
 if(_handlerBotaoFechar){botao_fechar.removeEventListener("click", _handlerBotaoFechar);}
 _handlerBotaoFechar = function(){GModalApproval.cancelarTodos(configuracao);};
 botao_fechar.addEventListener("click", _handlerBotaoFechar);
}
},
 confirmar :function(configuracao){
 
 var valor = 'o:1';
 
 var elementos = document.getElementsByClassName('gpc_modal_lgpd-opcoes-selecao');
 let editado = false;
 if (elementos.length){
 for (var i = 0;i < elementos.length;i++){
 valor += '&'+elementos[i].id+':'+(elementos[i].classList.contains('gpc_modal_lgpd-opcoes-selecao_selecionado') ? '1' :'0');
 if (elementos[i].classList.contains('gpc_modal_lgpd-opcoes-selecao') == true){
 for (var x = 0;x < configuracao.opcoes.length;x++){
 if (configuracao.opcoes[x].id == elementos[i].id){
 if(configuracao.opcoes[x].valor != elementos[i].classList.contains('gpc_modal_lgpd-opcoes-selecao_selecionado')){editado = true;}
 configuracao.opcoes[x].valor = elementos[i].classList.contains('gpc_modal_lgpd-opcoes-selecao_selecionado');
}
}
}
}
}
 configuracao.editado = editado;
 GModalApproval.salvar_preferencias(valor,configuracao.dominio);
 
 
 FecharGM(_idModal);
 
 var elemento = document.getElementById('gpc-lgpd');
 if (elemento != null){
 
 elemento.remove();
 
 GModalApproval.botao(configuracao);
}
 
 GModalApproval.posicionar();
 
 GModalApproval.remover_preferencias(configuracao);
},
 confirmarTodos :function(configuracao){
 
 var valor = 'o:1';
 
 for (var x = 0;x < configuracao.opcoes.length;x++){
 if(configuracao.opcoes[x].hasOwnProperty('valor')){
 configuracao.opcoes[x].valor = true;
 valor += '&'+configuracao.opcoes[x].id+':1';
}
}
 GModalApproval.salvar_preferencias(valor,configuracao.dominio);
 GModalApproval.instalar_scripts(configuracao);
 configuracao.editado = true;
 
 var elemento = document.getElementById('gpc-lgpd');
 if(elemento != null){elemento.remove();}
 
 GModalApproval.botao(configuracao);
},
 cancelarTodos :function(configuracao){
 
 var valor = 'o:1';
 
 for (var x = 0;x < configuracao.opcoes.length;x++){
 if(configuracao.opcoes[x].hasOwnProperty('valor')){
 configuracao.opcoes[x].valor = false;
 valor += '&'+configuracao.opcoes[x].id+':0';
}
}
 configuracao.editado = true;
 GModalApproval.salvar_preferencias(valor,configuracao.dominio);
 GModalApproval.instalar_scripts(configuracao);
 
 var elemento = document.getElementById('gpc-lgpd');
 if(elemento != null){elemento.remove();}
 
 GModalApproval.botao(configuracao);
},
 
 preferencias :function(){
 
 var strNomeIgual = "gpages_cookies=";
 var cookie_array = document.cookie.split(';');
 
 for(var i = 0;i < cookie_array.length;i++){
 var cookie_string = cookie_array[i];
 while (cookie_string.charAt(0) == ' '){cookie_string = cookie_string.substring(1, cookie_string.length);}
 if (cookie_string.indexOf(strNomeIgual) != -1){return cookie_string.substring(strNomeIgual.length, cookie_string.length);}
}
 
 return null;
},
 salvar_preferencias :function(preferencias, dominio){
 
 if (dominio == undefined){dominio = '';}
 var data = new Date();
 
 data.setTime(data.getTime() + (365 * 24 * 60 * 60 * 1000));
 document.cookie = "gpages_cookies=" + preferencias + ";Expires=" + data.toGMTString() + ";Path=/;"+(dominio ? ' Domain='+dominio :'');
 
 return true;
},
 remover_preferencias :function(configuracao){
 
 if(configuracao.editado){
 var cookie_array = document.cookie.split(';');
 var cookies_limpos = '';
 for(var i = 0;i < cookie_array.length;i++){
 var cookie_string = cookie_array[i];
 while (cookie_string.charAt(0) == ' '){cookie_string = cookie_string.substring(1, cookie_string.length);}
 if (cookie_string.indexOf('gpages_') === -1){cookies_limpos += cookie_string.substring(0,cookie_string.indexOf('='))+"=;Expires=Thu, 01 Jan 1970 00:00:01 GMT;Path=/;"+(configuracao.dominio ? ' Domain='+configuracao.dominio :'');}
 else{cookies_limpos += cookie_string;}
}
 document.cookie = cookies_limpos;
 
 setTimeout(function(){document.location.reload(true);},100);
}
},
 
 instalar_scripts :function(configuracao,loader){
 if(loader == undefined){loader = true;}
 
 let cookie = GModalApproval.preferencias() || 'o:1&e:0&m:0';
 
 if(configuracao.opcoes != ''){for (var x = 0;x < configuracao.opcoes.length;x++){configuracao.opcoes[x].valor = (cookie.indexOf(configuracao.opcoes[x].id+':1') !== -1 ? true :false);}}
 if(configuracao.hasOwnProperty('opcoes')){
 let total = Object.entries(configuracao.opcoes).length;
 for (var i = 0;i < total;i++){
 if((configuracao.opcoes[i].valor == true || configuracao.opcoes[i].valor == 'true') && configuracao.opcoes[i].hasOwnProperty('codigos')){
 let scripts = configuracao.opcoes[i]['codigos']();
 let total_scripts = Object.entries(scripts).length;
 if(total_scripts){
 let tipo = '_'+configuracao.opcoes[i]['id'];
 $('.gle_css'+tipo).removeClass('gle_css'+tipo).addClass('gle_css');
 $('.gle_scripts'+tipo).removeClass('gle_scripts'+tipo).addClass('gle_scripts');
 Object.entries(scripts).forEach(([key, value]) =>{
 if(scripts[key].hasOwnProperty('html')){
 let div = document.createElement("div");
 div.innerHTML = scripts[key]['html'];
 document.body.appendChild(div);
}
 setTimeout(function(){
 if(scripts[key].hasOwnProperty('js_interno')){
 let total_js_interno = Object.entries(scripts[key]['js_interno']).length;
 for (let y = 0;y < total_js_interno;y++){
 let script = document.createElement("script"), conteudo = scripts[key]['js_interno'][y].toString();
 conteudo = conteudo.substr(11,conteudo.length);
 conteudo = conteudo.substr(0,(conteudo.length-1));
 script.innerHTML = conteudo;
 document.body.appendChild(script);
}
}
},50);
});
}
}
}
 if(loader){GreatLoader('atualizar');}
}
}
};
}();




'use strict';

var GTooltip = function(){
 return{
 instalar :function(configuracao){
 
 if (configuracao.hasOwnProperty('elemento') == false){configuracao.elemento = '';}
 if (configuracao.hasOwnProperty('direcao') == false){configuracao.direcao = 'cima';}
 if (configuracao.direcao != 'cima' && configuracao.direcao != 'baixo' && configuracao.direcao != 'direita' && configuracao.direcao != 'esquerda'){configuracao.direcao = 'cima';}
 if (configuracao.elemento != ''){
 
 var elementos = document.querySelectorAll(configuracao.elemento);
 
 if (elementos.length){
 for (var i = 0;i < elementos.length;i++){
 elementos[i].addEventListener('mouseenter', function(){GTooltip.adicionar(this, configuracao.direcao);}, false);
 elementos[i].addEventListener('mouseout', function(){GTooltip.remover(this);}, false);
}
}
}
},
 adicionar :function(elemento, direcao){
 if (elemento.dataset.gtt != ''){
 
 var gtt = document.createElement("div");
 gtt.className = 'gtt_caixa gtt_caixa-'+direcao;
 gtt.innerHTML = '<span class="gtt_caixa-seta"></span><span class="gtt_caixa-conteudo">'+elemento.dataset.gtt+'</span>';
 document.body.appendChild(gtt);
 
 var pagina_offset = window.scrollY || window.pageYOffset;
 var elemento_offset = elemento.getBoundingClientRect();
 var gtt_width = parseFloat(getComputedStyle(gtt).width.replace("px", ""));
 var gtt_height = parseFloat(getComputedStyle(gtt).height.replace("px", ""));
 let caixa = document.querySelector('.gmf');
 let drawer = document.querySelector('#gpc-menu');
 let zindex = '';
 if(drawer != null){zindex = 9999999999999+1;}
 if(caixa != null){zindex = caixa.style.zIndex+1;}
 gtt.style.zIndex = zindex;
 
 if (direcao == 'cima'){
 
 gtt.style.top = (pagina_offset+(elemento_offset.top-gtt_height))-10+'px';
 gtt.style.left = (elemento_offset.left+(elemento.offsetWidth/2))-(gtt_width/2)+'px';
 
 var gtt_seta = gtt.querySelector('.gtt_caixa-seta');
 gtt_seta.style.zIndex = zindex;
 gtt_seta.style.bottom = '-10px';
 gtt_seta.style.left = ((gtt_width/2)-5)+'px';
}else if (direcao == 'baixo'){
 
 gtt.style.top = (pagina_offset+(elemento_offset.top+elemento.offsetHeight))+10+'px';
 gtt.style.left = (elemento_offset.left+(elemento.offsetWidth/2))-(gtt_width/2)+'px';
 
 var gtt_seta = gtt.querySelector('.gtt_caixa-seta');
 gtt_seta.style.zIndex = zindex;
 gtt_seta.style.top = '-10px';
 gtt_seta.style.left = ((gtt_width/2)-5)+'px';
}else if (direcao == 'esquerda'){
 
 gtt.style.top = (pagina_offset+(elemento_offset.top+(elemento.offsetHeight/2))-(gtt_height/2))+'px';
 gtt.style.left = (elemento_offset.left-gtt_width)-10+'px';
 
 var gtt_seta = gtt.querySelector('.gtt_caixa-seta');
 gtt_seta.style.zIndex = zindex;
 gtt_seta.style.right = '-10px';
 gtt_seta.style.top = ((gtt_height/2)-5)+'px';
}else if (direcao == 'direita'){
 
 gtt.style.top = (pagina_offset+(elemento_offset.top+(elemento.offsetHeight/2))-(gtt_height/2))+'px';
 gtt.style.left = (elemento_offset.left+elemento.offsetWidth)+10+'px';
 
 var gtt_seta = gtt.querySelector('.gtt_caixa-seta');
 gtt_seta.style.zIndex = zindex;
 gtt_seta.style.left = '-10px';
 gtt_seta.style.top = ((gtt_height/2)-5)+'px';
}
}
},
 remover :function(elemento){
 if (elemento.dataset.gtt != ''){
 
 var gtt = document.body.querySelector('.gtt_caixa');
 
 if(gtt != null || window.navigator.sayswho.toLowerCase().indexOf('ie') !== false){gtt.remove();}
}
}
};
}();'use strict';

var gsi_instancias ={};
var gsi_intervalo ={};
var timeout_resize_slider;

var GSlideImage = function(){
 return{
 iniciar:function(id){
 let instancias;
 if(id != undefined){instancias = document.querySelectorAll('#'+id+' .gsi');}
 else{instancias = document.querySelectorAll('.gsi');}
 if(instancias){
 for (let i = 0;i < instancias.length;i++){
 if(!instancias[i].querySelectorAll('.imagem').length){continue;}
 let slider, id_slider;
 slider = instancias[i].closest('.c, .conteudo');
 id_slider = 'gsi_'+slider.parentElement.getAttribute('id');
 if(gsi_intervalo.hasOwnProperty(id_slider)){
 GSlideImage.destruir(id_slider);
 GSlideImage.iniciar(slider.parentElement.getAttribute('id'));
 continue;
}
 instancias[i].setAttribute('id',id_slider);
 gsi_instancias[id_slider] ={
 'efeito' :'slide',
 'imagens' :[],
 'imagens_ordem' :[],
 'imagens_view' :parseInt(slider.getAttribute('gpc-slide_view')),
 'imagens_margin' :parseInt(slider.getAttribute('gpc-slide_view_espaco')),
 'autoplay' :(slider.getAttribute('gpc-slide_auto') == 'true' || slider.getAttribute('gpc-slide_auto') == true ? true :false),
 'transforms' :{},
 'total':(instancias[i].querySelectorAll('.imagem') ? instancias[i].querySelectorAll('.imagem').length :0),
 'slide':0,
 'tamanho':0,
 'touch_ativo':false,
 'touch_posicao_inicio':0,
 'touch_posicao_movendo':0,
 'touch_limite':0,
 'touch_slide':0,
 'touch_mover':false,
 'touch_arrastou':false,
};
 
 GSlideImage.imagens(id_slider,true);
 for (let x = 0;x < gsi_instancias[id_slider]['imagens'].length;x++){
 let elemento = instancias[i].querySelector('#'+gsi_instancias[id_slider]['imagens'][x]);
 elemento.setAttribute('posicao',x);
 elemento.style.transition = '0s linear';
 if(x == (gsi_instancias[id_slider]['imagens'].length-1) && gsi_instancias[id_slider]['imagens'].length > gsi_instancias[id_slider]['imagens_view']){elemento.style.transform = 'matrix(1, 0, 0, 1, '+(gsi_instancias[id_slider]['tamanho']*-1)+', 0)';}
 else{elemento.style.transform = 'matrix(1, 0, 0, 1, '+(gsi_instancias[id_slider]['transforms'][x])+', 0)';}
 if(x < gsi_instancias[id_slider]['imagens_view']){
 elemento.classList.add('ativo');
 elemento.style.opacity = 1;
}
}
 GSlideImage.imagens_ordem(id_slider);
 let reiniciar = false;
 if(gsi_instancias[id_slider]['imagens'].length < gsi_instancias[id_slider]['imagens_view']+2){
 let y = gsi_instancias[id_slider]['imagens'].length;
 for (let x = 0;x < gsi_instancias[id_slider]['imagens'].length;x++){
 let original = instancias[i].querySelector('#'+gsi_instancias[id_slider]['imagens'][x]);
 if(original){
 let clone = document.createElement("div");
 clone.setAttribute('id','clone_'+gsi_instancias[id_slider]['imagens'][x].replace('clone_','')+y);
 clone.classList.add('gsi_clone','imagem');
 clone.setAttribute('posicao',gsi_instancias[id_slider]['imagens'].length);
 clone.style.opacity=0;
 clone.setAttribute('gsi_origem',(original.getAttribute('gsi_origem') ? original.getAttribute('gsi_origem') :original.getAttribute('id')));
 clone.style.backgroundImage = window.getComputedStyle(original)['backgroundImage'];
 clone.style.width = ((100-gsi_instancias[id_slider]['imagens_margin'])/gsi_instancias[id_slider]['imagens_view'])+'%';
 clone.style.transform = 'matrix(1, 0, 0, 1, '+(gsi_instancias[id_slider]['transforms'][gsi_instancias[id_slider]['imagens_view']])+', 0)';
 let link_original = original.querySelector(':scope > a.gsi_link');
 if(link_original){clone.appendChild(link_original.cloneNode(true));}
 instancias[i].querySelector('.gsi_imagens').appendChild(clone);
}
 y++;
}
 reiniciar = true;
}
 if(reiniciar){
 GSlideImage.destruir(id_slider,false);
 GSlideImage.iniciar(slider.parentElement.getAttribute('id'));
 continue;
}
 
 let proximo = instancias[i].querySelector('.gsi_proximo');
 if(proximo){
 proximo.addEventListener('click',function(e){GSlideImage.acao(proximo.closest('.gsi').getAttribute('id'),'proximo', e);},false);
 if(gsi_instancias[id_slider]['imagens'].length <= gsi_instancias[id_slider]['imagens_view']){proximo.style.pointerEvents = 'none';}
}
 let anterior = instancias[i].querySelector('.gsi_anterior');
 if(anterior){
 anterior.addEventListener('click',function(e){GSlideImage.acao(anterior.closest('.gsi').getAttribute('id'),'anterior', e);},false);
 if(gsi_instancias[id_slider]['imagens'].length <= gsi_instancias[id_slider]['imagens_view']){anterior.style.pointerEvents = 'none';}
}
 let touch = instancias[i].querySelector('.gsi_imagens');
 if(touch){
 touch.addEventListener('mousedown',function(e){GSlideImage.acao(touch.closest('.gsi').getAttribute('id'),'touch',e)},false);
 touch.addEventListener('mousemove',function(e){GSlideImage.acao(touch.closest('.gsi').getAttribute('id'),'touch',e);},false);
 touch.addEventListener('mouseleave',function(e){GSlideImage.acao(touch.closest('.gsi').getAttribute('id'),'touch',e);},false);
 touch.addEventListener('mouseup',function(e){GSlideImage.acao(touch.closest('.gsi').getAttribute('id'),'touch',e);},false);
 touch.addEventListener('touchstart',function(e){GSlideImage.acao(touch.closest('.gsi').getAttribute('id'),'touch',e)},false);
 touch.addEventListener('touchmove',function(e){GSlideImage.acao(touch.closest('.gsi').getAttribute('id'),'touch',e);},false);
 touch.addEventListener('touchleave',function(e){GSlideImage.acao(touch.closest('.gsi').getAttribute('id'),'touch',e)},false);
 touch.addEventListener('touchcancel',function(e){GSlideImage.acao(touch.closest('.gsi').getAttribute('id'),'touch',e)},false);
 touch.addEventListener('touchend',function(e){GSlideImage.acao(touch.closest('.gsi').getAttribute('id'),'touch',e)},false);
 touch.addEventListener('click',function(e){let alvo = touch.closest('.gsi');let gid = alvo ? alvo.getAttribute('id') : null;if(gid && gsi_instancias[gid] && gsi_instancias[gid]['touch_arrastou']){gsi_instancias[gid]['touch_arrastou'] = false;e.preventDefault();e.stopPropagation();}},true);
}
 
 if(gsi_instancias[id_slider]['autoplay'] && gsi_instancias[id_slider]['imagens'].length > gsi_instancias[id_slider]['imagens_view']){gsi_intervalo[id_slider] = setInterval(function(){GSlideImage.acao(id_slider);},(4000+i));}
 else if(!gsi_instancias[id_slider]['autoplay'] && gsi_intervalo.hasOwnProperty(id_slider)){
 gsi_instancias[id_slider]['autoplay'] = false;
 clearInterval(gsi_intervalo[id_slider]);
 delete gsi_intervalo[id_slider];
}
}
}
},
 destruir:function(id,excluir_clone){
 
 if(excluir_clone == undefined){excluir_clone = true;}
 if(id != undefined && id != ''){
 if(gsi_instancias.hasOwnProperty(id)){
 
 if(gsi_intervalo.hasOwnProperty(id)){
 gsi_intervalo[id] = clearInterval(gsi_intervalo[id]);
 delete gsi_intervalo[id];
}
 
 let instancia = document.querySelector("#"+id);
 if(instancia){
 
 let ativos = instancia.querySelectorAll('.ativo');
 if(ativos.length){
 for (let x = 0;x < ativos.length;x++){
 ativos[x].classList.remove("ativo");
 ativos[x].style.opacity = 0;
 ativos[x].style.display = '';
 ativos[x].style.transform = '';
 ativos[x].style.transition = '';
}
}
 
 if(excluir_clone){
 let clones = instancia.querySelectorAll('.gsi_clone');
 if(clones.length){for (let x = 0;x < clones.length;x++){clones[x].remove();}}
}
 
 instancia.removeAttribute('id');
}
 
 delete gsi_instancias[id];
}
}else{
 
 let instancias = document.querySelectorAll(".gsi");
 if (instancias.length){for (let i = 0;i < instancias.length;i++){if(instancias[i].id != '' && instancias[i].id != undefined){GSlideImage.destruir(instancias[i].id);}}}
}
},
 pausar:function(id){
 
 let instancias;
 if(id != undefined){instancias = document.querySelectorAll('#'+id);}
 else{instancias = document.querySelectorAll('.gsi');}
 for (let i = 0;i < instancias.length;i++){
 let id_slider = instancias[i].getAttribute('id');
 if(gsi_intervalo.hasOwnProperty(id_slider)){
 gsi_intervalo[id_slider] = clearInterval(gsi_intervalo[id_slider]);
 delete gsi_intervalo[id_slider];
}
}
},
 reiniciar:function(id){
 let instancias;
 if(id != undefined){instancias = document.querySelectorAll('#'+id);}
 else{instancias = document.querySelectorAll('.gsi');}
 if(instancias){
 
 for (let i = 0;i < instancias.length;i++){
 if(instancias[i]){
 let id_slider = instancias[i].getAttribute('id');
 GSlideImage.destruir(id_slider);
 GSlideImage.iniciar(instancias[i].parentElement.getAttribute('id'));
}
}
}
},
 imagens:function(id_slider, atualizar){
 let instancias;
 if(atualizar == undefined){atualizar = false;}
 if(id_slider != undefined){instancias = document.querySelectorAll('#'+id_slider);}
 else{instancias = document.querySelectorAll('.gsi');}
 if(instancias){
 for (let i = 0;i < instancias.length;i++){
 if(instancias[i]){
 if(!instancias[i].querySelectorAll('.imagem').length){continue;}
 let id = instancias[i].getAttribute('id');
 let imagens = instancias[i].querySelectorAll('.imagem');
 let elemento;
 let width = parseFloat(window.getComputedStyle(instancias[i])['width'])/gsi_instancias[id]['imagens_view'];
 gsi_instancias[id]['tamanho'] = width;
 gsi_instancias[id]['margin'] = (gsi_instancias[id]['imagens_margin'] > 0 ? gsi_instancias[id]['imagens_margin'] :0);
 for (let x = 0;x < imagens.length;x++){
 elemento = imagens[x];
 if(elemento.classList.contains('ativo')){elemento.style.opacity = 1;}
 else{elemento.style.opacity = 0;}
 if(atualizar){elemento.style.transition = '0s linear';}
 elemento.style.width = ((100-gsi_instancias[id]['imagens_margin'])/gsi_instancias[id]['imagens_view'])+'%';
 gsi_instancias[id]['imagens'][x] = elemento.getAttribute('id');
}
 
 if(gsi_instancias[id]['imagens_view'] == 3){
 for (let x = -1;x <= gsi_instancias[id]['imagens_view'];x++){
 if(x == gsi_instancias[id]['imagens_view']){
 gsi_instancias[id]['transforms'][x] = (gsi_instancias[id]['tamanho']*x)+(gsi_instancias[id]['tamanho']*((gsi_instancias[id]['margin']*1.5)/100));
}else if(x == 0){gsi_instancias[id]['transforms'][x]= 0;}
 else{
 if(x == -1){gsi_instancias[id]['transforms'][x]= (gsi_instancias[id]['tamanho']*x)-(gsi_instancias[id]['tamanho']*((gsi_instancias[id]['margin']*.5)/100));}
 else if(x == 1){gsi_instancias[id]['transforms'][x]= (gsi_instancias[id]['tamanho']*x)+(gsi_instancias[id]['tamanho']*((gsi_instancias[id]['margin']*.5)/100));}
 else{gsi_instancias[id]['transforms'][x]= (gsi_instancias[id]['tamanho']*x)+(gsi_instancias[id]['tamanho']*(gsi_instancias[id]['margin']/100));}
}
}
}else{
 for (let x = -1;x <= gsi_instancias[id]['imagens_view'];x++){
 if(x == gsi_instancias[id]['imagens_view']){gsi_instancias[id]['transforms'][x]= (gsi_instancias[id]['tamanho']*x)+((gsi_instancias[id]['tamanho']*2)*(gsi_instancias[id]['margin']/100));}
 else if(x == 0){gsi_instancias[id]['transforms'][x]= 0;}
 else{
 if(x == -1){gsi_instancias[id]['transforms'][x]= (gsi_instancias[id]['tamanho']*x)-(gsi_instancias[id]['tamanho']*(gsi_instancias[id]['margin']/100));}
 else{gsi_instancias[id]['transforms'][x]= (gsi_instancias[id]['tamanho']*x)+(gsi_instancias[id]['tamanho']*(gsi_instancias[id]['margin']/100));}
}
}
}
 
 for (let y = 0;y < gsi_instancias[id]['imagens_ordem'].length;y++){
 for (let x = 0;x < imagens.length;x++){
 if(gsi_instancias[id]['imagens_ordem'][y] == imagens[x].getAttribute('id')){
 imagens[x].style.opacity = 1;
 imagens[x].style.transform = 'matrix(1, 0, 0, 1, '+gsi_instancias[id]['transforms'][y-1]+', 0)';
 break;
}
}
}
}
}
}
},
 imagens_ordem:function(id){
 let instancia = document.querySelector("#"+id);
 if(instancia){
 if(!instancia.querySelectorAll('.imagem').length){return;}
 let elementos_mostrando = instancia.querySelectorAll('.ativo'),elementos = [];
 for (let i = 0;i < elementos_mostrando.length;i++){
 if(elementos.length){
 if(parseInt(instancia.querySelector('#'+elementos[(elementos.length-1)]).getAttribute('posicao')) < parseInt(elementos_mostrando[i].getAttribute('posicao'))){elementos.push(elementos_mostrando[i].getAttribute('id'));}
 else{elementos.unshift(elementos_mostrando[i].getAttribute('id'));}
}else{elementos[0]=elementos_mostrando[i].getAttribute('id');}
}
 
 if(elementos.length){
 let anterior, proximo, posicao = instancia.querySelector('#'+elementos[(elementos.length-1)]).getAttribute('posicao'), atual_teste = instancia.querySelector('#'+elementos[(elementos.length-1)]), continuar = true,x = 0;
 while (continuar){
 if(atual_teste.nextSibling){
 atual_teste = atual_teste.nextSibling;
}else{atual_teste = instancia.querySelector(".gsi_imagens .imagem:first-child");}
 if(!atual_teste.classList.contains('ativo') || x == (gsi_instancias[id]['total']-1)){
 continuar = false;
 proximo = atual_teste;
}
 x++;
}
 elementos.push(proximo.getAttribute('id'));
 
 posicao = instancia.querySelector('#'+elementos[0]).getAttribute('posicao');
 atual_teste = instancia.querySelector('#'+elementos[0]);
 continuar = true;
 x = 0;
 while (continuar){
 if(atual_teste.previousSibling){atual_teste = atual_teste.previousSibling;}
 else{atual_teste = instancia.querySelector(".gsi_imagens div:last-child");}
 if(!atual_teste.classList.contains('ativo') || x == (gsi_instancias[id]['total']-1)){
 continuar = false;
 anterior = atual_teste;
}
 x++;
}
 elementos.unshift(anterior.getAttribute('id'));
 
 let elementos_ordem = [];
 if(gsi_instancias[id]['imagens_view'] == 3){
 if(parseInt(instancia.querySelector('#'+elementos[3]).getAttribute('posicao')) == gsi_instancias[id]['total']-1 && parseInt(instancia.querySelector('#'+elementos[1]).getAttribute('posicao')) == 0){
 elementos_ordem[0] = elementos[0];
 if(proximo.getAttribute('posicao') == '1'){
 elementos_ordem[1] = elementos[2];
 elementos_ordem[2] = elementos[3];
 elementos_ordem[3] = elementos[1];
}else if(proximo.getAttribute('posicao') == '2'){
 elementos_ordem[1] = elementos[3];
 elementos_ordem[2] = elementos[1];
 elementos_ordem[3] = elementos[2];
}
 elementos_ordem[4] = elementos[4];
}else{elementos_ordem = elementos;}
}else if(gsi_instancias[id]['imagens_view'] == 2){
 if(parseInt(instancia.querySelector('#'+elementos[2]).getAttribute('posicao')) == gsi_instancias[id]['total']-1 && parseInt(instancia.querySelector('#'+elementos[1]).getAttribute('posicao')) == 0){
 elementos_ordem[0] = elementos[0];
 elementos_ordem[1] = elementos[2];
 elementos_ordem[2] = elementos[1];
 elementos_ordem[3] = elementos[3];
}else{elementos_ordem = elementos;}
}else{elementos_ordem = elementos;}
 gsi_instancias[id]['imagens_ordem'] = elementos_ordem;
}
}
},
 acao:function(id,acao,evento){
 if(evento == undefined){evento = null;}
 else{
 if(evento.type.substr(0,5) != 'touch' || (evento.type == 'touchmove' && gsi_instancias[id]['touch_posicao_movendo'] != 0)){
 evento.preventDefault();
 evento.stopPropagation();
}
}
 if(acao == undefined){acao = 'proximo';}
 let instancia = document.querySelector("#"+id);
 if(instancia){
 
 let clones = instancia.querySelectorAll('.gsi_clone');
 for (let c = 0;c < clones.length;c++){
 if(clones[c].style.backgroundImage && clones[c].style.backgroundImage != 'none'){continue;}
 let origem = instancia.querySelector('#'+clones[c].getAttribute('gsi_origem'));
 if(origem){clones[c].style.backgroundImage = window.getComputedStyle(origem)['backgroundImage'];}
}
 
 let proximo = instancia.querySelector('.gsi_proximo');
 let anterior = instancia.querySelector('.gsi_anterior');
 if(acao == 'proximo' || acao == 'anterior'){
 if(proximo){proximo.style.pointerEvents = 'none';}
 if(anterior){anterior.style.pointerEvents = 'none';}
 instancia.querySelector('.gsi_imagens').style.pointerEvents = 'none';
}
 let tempo = 400;
 
 if(gsi_instancias[id]['autoplay']){
 clearInterval(gsi_intervalo[id]);
 delete gsi_intervalo[id];
}
 
 if (acao == 'anterior'){
 if(gsi_instancias[id]['imagens_ordem'][0] == gsi_instancias[id]['imagens_ordem'][(gsi_instancias[id]['imagens_view']+1)]){
 let ultimo = instancia.querySelector('#'+gsi_instancias[id]['imagens_ordem'][0]);
 if(ultimo){
 ultimo.style.transition = '0s linear';
 ultimo.style.opacity = 0;
 ultimo.style.transform = 'matrix(1, 0, 0, 1, '+gsi_instancias[id]['transforms'][-1]+', 0)';
}
}
 if(gsi_instancias[id]['efeito'] == 'fade'){
 let elemento_mover;
 for (let i = 0;i <= (gsi_instancias[id]['imagens_view']+1);i++){
 elemento_mover = instancia.querySelector('#'+gsi_instancias[id]['imagens_ordem'][i]);
 if(elemento_mover){
 elemento_mover.style.transition = 'opacity '+((tempo*40)/100).toFixed(2)+'ms linear';
 elemento_mover.style.opacity = 0;
}
}
}
 
 let elemento_mover;
 for (let i = 0;i <= (gsi_instancias[id]['imagens_view']+1);i++){
 if(i < (gsi_instancias[id]['imagens_view'] + 1) && (gsi_instancias[id]['imagens_ordem'][0] != gsi_instancias[id]['imagens_ordem'][i] || i == 0)){
 elemento_mover = instancia.querySelector('#'+gsi_instancias[id]['imagens_ordem'][i]);
 if(elemento_mover){
 elemento_mover.style.transition = (gsi_instancias[id]['efeito'] == 'fade' ? 'opacity' :'transform')+' '+tempo+'ms linear';
 elemento_mover.classList.add('ativo');
 if(i == gsi_instancias[id]['imagens_view']){elemento_mover.classList.remove('ativo');}
 if(i > gsi_instancias[id]['imagens_view']){elemento_mover.style.transform = 'matrix(1, 0, 0, 1, '+gsi_instancias[id]['transforms'][gsi_instancias[id]['imagens_view']]+', 0)';}
 else{elemento_mover.style.transform = 'matrix(1, 0, 0, 1, '+gsi_instancias[id]['transforms'][i]+', 0)';}
 elemento_mover.style.opacity = 1;
}
}
}
 
}else if(acao == 'proximo'){
 if(gsi_instancias[id]['imagens_ordem'][0] == gsi_instancias[id]['imagens_ordem'][(gsi_instancias[id]['imagens_view']+1)]){
 let ultimo = instancia.querySelector('#'+gsi_instancias[id]['imagens_ordem'][(gsi_instancias[id]['imagens_view']+1)]);
 if(ultimo){
 ultimo.style.transition = '0s linear';
 ultimo.style.opacity = 0;
 ultimo.style.transform = 'matrix(1, 0, 0, 1, '+gsi_instancias[id]['transforms'][gsi_instancias[id]['imagens_view']]+', 0)';
}
}
 if(gsi_instancias[id]['efeito'] == 'fade'){
 let elemento_mover;
 for (let i = 0;i <= (gsi_instancias[id]['imagens_view']+1);i++){
 elemento_mover = instancia.querySelector('#'+gsi_instancias[id]['imagens_ordem'][i]);
 if(elemento_mover){
 elemento_mover.style.transition = 'opacity '+((tempo*40)/100).toFixed(2)+'ms linear';
 elemento_mover.style.opacity = 0;
}
}
}
 
 let elemento_mover;
 for (let i = 0;i <= (gsi_instancias[id]['imagens_view']+1);i++){
 elemento_mover = instancia.querySelector('#'+gsi_instancias[id]['imagens_ordem'][i]);
 if(elemento_mover){
 elemento_mover.style.transition = (gsi_instancias[id]['efeito'] == 'fade' ? 'opacity' :'transform')+' '+tempo+'ms linear';
 if(i <= 1){elemento_mover.style.transform = 'matrix(1, 0, 0, 1, '+gsi_instancias[id]['transforms'][-1]+', 0)';}
 else{elemento_mover.style.transform = 'matrix(1, 0, 0, 1, '+gsi_instancias[id]['transforms'][(i-2)]+', 0)';}
 if(i <= 1){elemento_mover.classList.remove('ativo');}
 else{elemento_mover.classList.add('ativo');}
 elemento_mover.style.opacity = 1;
}
}
 
}else if(acao == 'touch'){
 if((evento.type == 'mousedown' && evento.buttons == 1) || evento.type == 'touchstart'){
 gsi_instancias[id]['touch_ativo'] = true;
 gsi_instancias[id]['touch_arrastou'] = false;
 instancia.querySelector(".gsi_imagens").classList.add('gsi_imagens_drag');
 if(gsi_instancias[id]['touch_mover']){clearTimeout(gsi_instancias[id]['touch_slide']);}
 gsi_instancias[id]['touch_ativo'] = true;
 
 instancia.querySelector(".gsi_proximo").style.pointerEvents = 'none';
 instancia.querySelector(".gsi_anterior").style.pointerEvents = 'none';
 instancia.querySelector(".gsi_proximo").style.opacity = 0;
 instancia.querySelector(".gsi_anterior").style.opacity = 0;
 
 gsi_instancias[id]['touch_mover'] = true;
 gsi_instancias[id]['touch_limite'] = (instancia.getClientRects()[0]['width']*.5);
 
 if (evento.type === "touchstart"){gsi_instancias[id]['touch_posicao_inicio'] = (evento.touches[0].clientX-gsi_instancias[id]['touch_posicao_inicio']);}
 else{gsi_instancias[id]['touch_posicao_inicio'] = evento.clientX - gsi_instancias[id]['touch_posicao_inicio'];}
}else if (evento.type == 'mousemove' || evento.type == 'touchmove'){
 if(gsi_instancias[id]['touch_ativo'] && gsi_instancias[id]['touch_mover']){
 
 if (evento.type === "touchmove"){
 if(evento.touches[0].clientX==gsi_instancias[id]['touch_posicao_inicio']){gsi_instancias[id]['touch_posicao_movendo'] = 0;}
 else{
 gsi_instancias[id]['touch_posicao_movendo'] = Math.log(Math.abs(evento.touches[0].clientX - gsi_instancias[id]['touch_posicao_inicio']));
 if(evento.touches[0].clientX - gsi_instancias[id]['touch_posicao_inicio'] < 0){gsi_instancias[id]['touch_posicao_movendo'] = (gsi_instancias[id]['touch_posicao_movendo']*-1);}
 gsi_instancias[id]['touch_posicao_movendo'] += (evento.touches[0].clientX-gsi_instancias[id]['touch_posicao_inicio'])*.55;
}
}else{
 if(evento.clientX==gsi_instancias[id]['touch_posicao_inicio']){gsi_instancias[id]['touch_posicao_movendo'] = 0;}
 else{
 gsi_instancias[id]['touch_posicao_movendo'] = Math.log(Math.abs(evento.clientX-gsi_instancias[id]['touch_posicao_inicio']));
 if(evento.clientX - gsi_instancias[id]['touch_posicao_inicio'] < 0){gsi_instancias[id]['touch_posicao_movendo'] = (gsi_instancias[id]['touch_posicao_movendo']*-1);}
 gsi_instancias[id]['touch_posicao_movendo'] += (evento.clientX-gsi_instancias[id]['touch_posicao_inicio'])*.55;
 
}
}
 if(Math.abs(gsi_instancias[id]['touch_posicao_movendo']) > 4){gsi_instancias[id]['touch_arrastou'] = true;}
 if(gsi_instancias[id]['touch_posicao_movendo'] > 0){
 for (let i = 0;i <= (gsi_instancias[id]['imagens_view']+1);i++){
 let elemento;
 elemento = instancia.querySelector('#'+gsi_instancias[id]['imagens_ordem'][i]);
 elemento.style.opacity = 1;
 elemento.style.transition = '';
 elemento.style.transform = 'matrix(1, 0, 0, 1, '+(gsi_instancias[id]['transforms'][(i-1)]+gsi_instancias[id]['touch_posicao_movendo'])+',0)';
}
}else{
 for (let i = 0;i <= (gsi_instancias[id]['imagens_view']+1);i++){
 let elemento;
 elemento = instancia.querySelector('#'+gsi_instancias[id]['imagens_ordem'][i]);
 elemento.style.opacity = 1;
 elemento.style.transition = '';
 elemento.style.transform = 'matrix(1, 0, 0, 1, '+(gsi_instancias[id]['transforms'][(i-1)]+gsi_instancias[id]['touch_posicao_movendo'])+',0)';
}
}
}
}else{
 instancia.querySelector(".gsi_imagens").classList.remove('gsi_imagens_drag');
 if(gsi_instancias[id]['touch_ativo'] && gsi_instancias[id]['touch_mover']){
 let elemento;
 if(gsi_instancias[id]['touch_posicao_movendo'] >= ((gsi_instancias[id]['tamanho']*gsi_instancias[id]['imagens_view'])/6)){
 for (let i = 0;i <= (gsi_instancias[id]['imagens_view']+1);i++){
 elemento = instancia.querySelector('#'+gsi_instancias[id]['imagens_ordem'][i]);
 elemento.style.opacity = 1;
 elemento.classList.add('ativo');
 elemento.style.transition = 'transform 400ms linear';
 if (i >= gsi_instancias[id]['imagens_view']){
 elemento.classList.remove('ativo');
 elemento.style.transform = 'matrix(1, 0, 0, 1, '+gsi_instancias[id]['transforms'][gsi_instancias[id]['imagens_view']]+', 0)';
}else{elemento.style.transform = 'matrix(1, 0, 0, 1, '+gsi_instancias[id]['transforms'][i]+', 0)';}
}
}else if (gsi_instancias[id]['touch_posicao_movendo'] <= (((gsi_instancias[id]['tamanho']*gsi_instancias[id]['imagens_view'])/6)*-1)){
 for (let i = 0;i <= (gsi_instancias[id]['imagens_view']+1);i++){
 elemento = instancia.querySelector('#'+gsi_instancias[id]['imagens_ordem'][i]);
 elemento.style.transition = 'transform 400ms linear';
 elemento.style.opacity = 1;
 if(i <= 1){
 elemento.classList.remove('ativo');
 elemento.style.transform = 'matrix(1, 0, 0, 1, '+gsi_instancias[id]['transforms'][-1]+', 0)';
}else{
 elemento.classList.add('ativo');
 elemento.style.transform = 'matrix(1, 0, 0, 1, '+gsi_instancias[id]['transforms'][i-2]+', 0)';
}
}
}else{
 for (let i = 0;i <= (gsi_instancias[id]['imagens_view']+1);i++){
 elemento = instancia.querySelector('#'+gsi_instancias[id]['imagens_ordem'][i]);
 elemento.style.transition = 'transform 400ms linear';
 elemento.style.opacity = 1;
 if(i == 0){
 elemento.classList.remove('ativo');
 elemento.style.transform = 'matrix(1, 0, 0, 1, '+gsi_instancias[id]['transforms'][-1]+', 0)';
}else if(i == (gsi_instancias[id]['imagens_view']+1)){
 elemento.classList.remove('ativo');
 elemento.style.transform = 'matrix(1, 0, 0, 1, '+gsi_instancias[id]['transforms'][gsi_instancias[id]['imagens_view']]+', 0)';
}else{
 elemento.classList.add('ativo');
 elemento.style.transform = 'matrix(1, 0, 0, 1, '+gsi_instancias[id]['transforms'][i-1]+', 0)';
}
}
}
 gsi_instancias[id]['touch_slide'] = setTimeout(function(){
 GSlideImage.imagens_ordem(id);
 let ultimo = instancia.querySelector('#'+gsi_instancias[id]['imagens_ordem'][(gsi_instancias[id]['imagens_view']+1)]);
 ultimo.style.transition = '0s';
 ultimo.classList.remove('ativo');
 ultimo.style.opacity = 0;
 ultimo.style.transform = 'matrix(1, 0, 0, 1, '+gsi_instancias[id]['transforms'][gsi_instancias[id]['imagens_view']]+',0)';
 ultimo = instancia.querySelector('#'+gsi_instancias[id]['imagens_ordem'][0]);
 ultimo.style.transition = '0s';
 ultimo.classList.remove('ativo');
 ultimo.style.opacity = 0;
 ultimo.style.transform = 'matrix(1, 0, 0, 1, '+gsi_instancias[id]['transforms'][-1]+',0)';
 gsi_instancias[id]['touch_mover'] = false;
},tempo);
}
 instancia.querySelector(".gsi_imagens").style.pointerEvents = '';
 gsi_instancias[id]['touch_ativo'] = false;
 gsi_instancias[id]['touch_posicao_inicio'] = 0;
 gsi_instancias[id]['touch_posicao_movendo'] = 0;
 if(proximo && gsi_instancias[id]['imagens'].length > gsi_instancias[id]['imagens_view']){
 proximo.style.pointerEvents = '';
 proximo.style.opacity = '';
}
 if(anterior && gsi_instancias[id]['imagens'].length > gsi_instancias[id]['imagens_view']){
 anterior.style.pointerEvents = '';
 anterior.style.opacity = '';
}
}
}
 if(acao != 'touch'){
 let tempo_touch = (parseFloat(150)*2+parseFloat((((150*45)/100).toFixed(0))));
 gsi_instancias[id]['slide'] = setTimeout(function(){
 GSlideImage.imagens_ordem(id);
 if(acao == 'proximo'){
 let ultimo = instancia.querySelector('#'+gsi_instancias[id]['imagens_ordem'][(gsi_instancias[id]['imagens_view']+1)]);
 if(ultimo){
 ultimo.style.transition = '0s linear';
 ultimo.classList.remove('ativo');
 ultimo.style.opacity = 0;
 ultimo.style.transform = 'matrix(1, 0, 0, 1, '+gsi_instancias[id]['transforms'][gsi_instancias[id]['imagens_view']]+', 0)';
}
 if(gsi_instancias[id]['imagens_ordem'][0] != gsi_instancias[id]['imagens_ordem'][(gsi_instancias[id]['imagens_view']+1)]){
 ultimo = instancia.querySelector('#'+gsi_instancias[id]['imagens_ordem'][0]);
 if(ultimo){
 ultimo.style.transition = '0s linear';
 ultimo.classList.remove('ativo');
 ultimo.style.opacity = 0;
 ultimo.style.transform = 'matrix(1, 0, 0, 1, '+gsi_instancias[id]['transforms'][-1]+', 0)';
}
}
}else{
 let ultimo = instancia.querySelector('#'+gsi_instancias[id]['imagens_ordem'][(gsi_instancias[id]['imagens_view']+1)]);
 if(ultimo){
 ultimo.style.transition = '0s linear';
 ultimo.classList.remove('ativo');
 ultimo.style.opacity = 0;
}
 if(gsi_instancias[id]['imagens_ordem'][0] != gsi_instancias[id]['imagens_ordem'][(gsi_instancias[id]['imagens_view']+1)]){
 if(ultimo){ultimo.style.transform = 'matrix(1, 0, 0, 1, '+gsi_instancias[id]['transforms'][gsi_instancias[id]['imagens_view']]+', 0)';}
 ultimo = instancia.querySelector('#'+gsi_instancias[id]['imagens_ordem'][0]);
 if(ultimo){
 ultimo.style.transition = '0s linear';
 ultimo.classList.remove('ativo');
 ultimo.style.opacity = 0;
 ultimo.style.transform = 'matrix(1, 0, 0, 1, '+gsi_instancias[id]['transforms'][-1]+', 0)';
}
}else{if(ultimo){ultimo.style.transform = 'matrix(1, 0, 0, 1, '+gsi_instancias[id]['transforms'][-1]+', 0)';}}
}
 if(proximo && gsi_instancias[id]['imagens'].length > gsi_instancias[id]['imagens_view']){proximo.style.pointerEvents = '';}
 if(anterior && gsi_instancias[id]['imagens'].length > gsi_instancias[id]['imagens_view']){anterior.style.pointerEvents = '';}
 instancia.querySelector('.gsi_imagens').style.pointerEvents = '';
},tempo_touch);
}
 
 if(gsi_instancias[id]['autoplay']){gsi_intervalo[id] = setInterval(function(){GSlideImage.acao(id);},4000);}
}else{
 
 if(gsi_instancias.hasOwnProperty(id)){
 if(gsi_instancias[id]['autoplay']){
 clearInterval(gsi_intervalo[id]);
 delete gsi_intervalo[id];
}
}
}
}
}
}();
$(function(){
 GSlideImage.iniciar();
 window.addEventListener('resize', function(e){
 
 e.preventDefault();
 e.stopPropagation();
 
 var altura = window.innerHeight, largura = window.innerWidth;
 if(timeout_resize_slider){clearTimeout(timeout_resize_slider);timeout_resize_slider = null;}
 timeout_resize_slider = setTimeout(function(){
 if(altura == window.innerHeight && largura == window.innerWidth){
 let instancias = document.querySelectorAll(".gsi");
 if(instancias){
 for (let i = 0;i < instancias.length;i++){
 if(instancias[i].getAttribute('id') != '' && instancias[i].getAttribute('id') != null && instancias[i].getAttribute('id') != undefined){GSlideImage.imagens(instancias[i].getAttribute('id'),true);}
 else{GSlideImage.iniciar(instancias[i].closest('.c, .conteudo').getAttribute('id'));}
}
}
}
},500);
});
});
var gqa_status = false;
var gqa_fila = [];
var gqa_executando = false;

function ControlarFilaGQA(){
 
 if (gqa_executando){clearTimeout(gqa_executando);}
 
 gqa_executando = setInterval(function(){ExecutarFilaGQA();}, (document.hidden) ? 8000 :100);
}



function AdicionarFilaGQA(parametros){
 
 if (parametros.hasOwnProperty('verbo') == false){parametros.verbo = 'POST';}
 if (parametros.hasOwnProperty('url') == false){return false;}
 if (parametros.hasOwnProperty('uri') == false){parametros.uri = '';}
 else{
 if(typeof parametros.uri == 'object' || typeof parametros.uri == 'array'){
 parametros.uri = FormatarUriGQA(parametros.uri);
}
}
 if (parametros.hasOwnProperty('extensao') == false){parametros.extensao = 'json';}
 if (parametros.hasOwnProperty('prioridade') == false){parametros.prioridade = 'baixa';}
 if (parametros.hasOwnProperty('carregar') == false){parametros.carregar = false;}
 if (parametros.hasOwnProperty('timeout') == false){parametros.timeout = 10000;}
 
 if (parametros.prioridade == 'alta'){
 
 EnviarAjaxGQA(parametros);
}else if (parametros.prioridade == 'media'){
 
 gqa_fila.unshift([parametros]);
}else if (parametros.prioridade == 'baixa'){
 
 gqa_fila.push([parametros]);
}
}
function ExecutarFilaGQA(){
 if (gqa_status == false && gqa_fila.length){
 
 var proximo = gqa_fila.shift();
 
 gqa_status = true;
 
 EnviarAjaxGQA(proximo[0])
}
}
function EnviarAjaxGQA(parametros){
 
 if (parametros.hasOwnProperty('verbo') == false){parametros.verbo = 'POST';}
 if (parametros.hasOwnProperty('url') == false){return false;}
 if (parametros.hasOwnProperty('uri') == false){parametros.uri = '';}
 if (parametros.hasOwnProperty('extensao') == false){parametros.extensao = 'json';}
 if (parametros.hasOwnProperty('prioridade') == false){parametros.prioridade = 'baixa';}
 if (parametros.hasOwnProperty('carregar') == false){parametros.carregar = false;}
 if (parametros.hasOwnProperty('timeout') == false){parametros.timeout = 10000;}
 if (parametros.hasOwnProperty('externo') == false){parametros.externo = false;}
 if (parametros.hasOwnProperty('funcao_erro') == false){parametros.funcao_erro = '';}
 if (parametros.hasOwnProperty('funcao_sucesso') == false){parametros.funcao_sucesso = '';}
 
 if (parametros.carregar == true){GLoading.carregar({'ativar':true});}
 
 if (parametros.verbo == 'POST'){
 var url = parametros.url;
 var dados = parametros.uri;
}else{
 if (parametros.uri){
 var url = parametros.url+'?'+parametros.uri;
}else{var url = parametros.url;}
 var dados = '';
}
 
 var requisicao = new XMLHttpRequest();
 requisicao.open(parametros.verbo, url, true);
 requisicao.timeout = parametros.timeout;
 if (parametros.extensao){requisicao.responseType = parametros.extensao;}
 requisicao.withCredentials = true;
 requisicao.overrideMimeType("application/"+parametros.extensao);
 if (parametros.verbo == 'POST'){
 requisicao.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
}
 if (parametros.externo){
 requisicao.withCredentials = false;
 requisicao.setRequestHeader('Content-Type', "application/json");
 requisicao.setRequestHeader('Access-Control-Allow-Origin', '*');
 requisicao.setRequestHeader('Access-Control-Allow-Headers', "*");
 requisicao.setRequestHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
}
 requisicao.onreadystatechange = function(){
 if (this.readyState == 4){
 if (this.status >= 200 && this.status < 400){
 
 if (this.responseType == 'json'){
 var resposta = this.response;
}else if (this.responseType == 'text' || this.responseType == ''){
 var resposta = this.responseText;
}else{
 var resposta = this.response;
}
 
 if (parametros.funcao_sucesso){parametros.funcao_sucesso(resposta);}
 
 GLoading.carregar({'ativar':false});
 
 gqa_status = false;
}else{
 
 if (parametros.funcao_erro){parametros.funcao_erro(this);}
 
 GLoading.carregar({'ativar':false});
 
 
 
 gqa_status = false;
}
}
};
 requisicao.send(dados);
 requisicao = null;

 

 
}
function FormatarUriGQA(post, prefixo){
 var retorno = [], post_chave, post_valor;
 for(var p in post){
 if (!post.hasOwnProperty(p)){continue;}
 if (~p.indexOf('[')){post_chave = prefixo ? prefixo + "[" + p.substring(0, p.indexOf('[')) + "]" + p.substring(p.indexOf('[')) :p;}
 else{post_chave = prefixo ? prefixo + "[" + p + "]" :p;}
 post_valor = post[p];
 retorno.push(typeof post_valor == "object" ? FormatarUriGQA(post_valor, post_chave) :encodeURIComponent(post_chave) + "=" + encodeURIComponent(post_valor));
}
 return retorno.join("&");
}
$(function(){
 
 if(document.addEventListener){document.addEventListener("visibilitychange", ControlarFilaGQA);}
 
 ControlarFilaGQA();
});'use strict';

var go_elementos = [];

var GObserver = function(){
 return{
 iniciar :function (){
 
 window.addEventListener('resize', function(){GObserver.observar(true);}, false);
 window.addEventListener('scroll', function(){GObserver.observar(true);}, false);
 document.addEventListener('scroll', function(){GObserver.observar(true);}, true);
},
 instalar :function(configuracao){
 
 if (configuracao.hasOwnProperty('elemento') == false){configuracao.elemento = '';}
 if (configuracao.hasOwnProperty('antecipacao') == false){configuracao.antecipacao = 0;}
 if (configuracao.hasOwnProperty('executar') == false){configuracao.executar = '';}
 
 if (configuracao.elemento != ''){
 
 var elementos = document.querySelectorAll(configuracao.elemento);
 
 if (elementos.length){
 for (var i = 0;i < elementos.length;i++){
 if (elementos[i].id){
 
 var instalar ={
 'elemento' :elementos[i],
 'antecipacao' :configuracao.antecipacao,
 'executar' :configuracao.executar
};
 
 go_elementos.push(instalar);
}
}
 
 GObserver.observar(false);
}
}
},
 observar :function(antecipacao){
 
 if (go_elementos.length){
 
 var janela_top = window.scrollY || window.pageYOffset;
 var janela_bottom = janela_top+window.innerHeight;
 for(var i = 0;i < go_elementos.length;i++){
 
 var antecipar = (antecipacao == true ? go_elementos[i].antecipacao :0);
 var elemento = go_elementos[i].elemento;
 if (elemento !== null && elemento !== undefined && elemento.isConnected){
 var elemento_estilo = window.getComputedStyle(elemento);
 if (elemento_estilo.display !== 'none'){
 var elemento_top = elemento.getBoundingClientRect().top+janela_top;
 var elemento_bottom = elemento_top+elemento.clientHeight;
 
 if (elemento_bottom >= janela_top && (elemento_top-antecipar) <= janela_bottom){
 
 (function(index){go_elementos[index].executar(go_elementos[index].elemento);})(i);
 
 go_elementos.splice(i, 1);
 
 this.observar(antecipacao);break;
}
}
}
}
}
}
};
}();


GObserver.iniciar();

 elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0cac3791660967':{'desktop':42.5985, 'mobile':12.017}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0cecf880873188':{'desktop':191.998, 'mobile':103.841}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0cf1f225318399':{'desktop':265.313, 'mobile':265.703}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0cfe6103074523':{'desktop':312.478, 'mobile':748.186}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d049316649105':{'desktop':699.5, 'mobile':949.686}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d0b2330345778':{'desktop':699.511, 'mobile':951.05}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d123461924032':{'desktop':107.723, 'mobile':0.0269999}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d1bd539412488':{'desktop':352.723, 'mobile':55.027}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d236980109873':{'desktop':14.6245, 'mobile':8}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d2a6747903325':{'desktop':64.3984, 'mobile':253.199}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d30d235067956':{'desktop':156, 'mobile':148.484}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d377398737901':{'desktop':387, 'mobile':399.284}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d402939090230':{'desktop':387, 'mobile':214.202}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d46f230565721':{'desktop':133.2, 'mobile':436.993}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d4e5453839534':{'desktop':166.523, 'mobile':442.198}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d550900383256':{'desktop':145.925, 'mobile':153.696}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d5b9257785774':{'desktop':421.43, 'mobile':408.618}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d61e673747042':{'desktop':399.728, 'mobile':220.394}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d670078296165':{'desktop':22.4134, 'mobile':10.781}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d6bc852475715':{'desktop':116.6, 'mobile':128}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d706435564209':{'desktop':124.906, 'mobile':135.734}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d754861552485':{'desktop':318.214, 'mobile':377.993}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d79a387739784':{'desktop':116.612, 'mobile':127.969}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d7e3155262840':{'desktop':117.15, 'mobile':127.93}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d84b633822075':{'desktop':125.453, 'mobile':135.726}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d8a0478897783':{'desktop':304.366, 'mobile':378.005}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d8f2748660930':{'desktop':117.462, 'mobile':128.03}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d937346737157':{'desktop':117.45, 'mobile':641.242}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d989754451287':{'desktop':125.75, 'mobile':649.375}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0d9db971928639':{'desktop':309.269, 'mobile':902.995}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0da25258110324':{'desktop':117.462, 'mobile':641.23}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0da6f961194816':{'desktop':424.169, 'mobile':641.2}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0dac3276913623':{'desktop':432.469, 'mobile':649.422}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0db1a327561746':{'desktop':625.783, 'mobile':908.725}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0db65299362500':{'desktop':424.181, 'mobile':641.23}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0dbc6794397047':{'desktop':424.469, 'mobile':1151.54}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0dc1e792222787':{'desktop':432.773, 'mobile':1162.98}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0dc7c038152467':{'desktop':611.685, 'mobile':1413.09}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0dd07956764363':{'desktop':424.178, 'mobile':1154.58}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0dd61068330905':{'desktop':424.769, 'mobile':1154.44}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0ddb9121139756':{'desktop':433.07, 'mobile':1163.14}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0de19500804973':{'desktop':611.688, 'mobile':1413.13}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0de70506560139':{'desktop':424.781, 'mobile':1154.39}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0dec3742888468':{'desktop':0, 'mobile':0}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0df20891252611':{'desktop':1.326, 'mobile':12.35}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0df89084564821':{'desktop':91.4565, 'mobile':146.846}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0e03c827655419':{'desktop':225.026, 'mobile':321.35}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0e0a7456423498':{'desktop':323.085, 'mobile':417.7}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0e107139003127':{'desktop':465.085, 'mobile':702.7}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0e163860353089':{'desktop':301.667, 'mobile':487.665}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0e1cb432767678':{'desktop':533.1, 'mobile':798.392}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0e233284546554':{'desktop':533.085, 'mobile':814.661}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0e2a5245211568':{'desktop':538.328, 'mobile':860.948}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0e30d999826171':{'desktop':677.085, 'mobile':1064.04}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0e372896990181':{'desktop':771.385, 'mobile':1178.77}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0e3db902986784':{'desktop':749.961, 'mobile':1248.76}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0e448671119191':{'desktop':913.385, 'mobile':1464.59}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0e4ac678893617':{'desktop':-32, 'mobile':-32.305}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0e528452674839':{'desktop':-33.5074, 'mobile':-35.2699}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0e592366992583':{'desktop':1011.82, 'mobile':1547.35}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0e609737871414':{'desktop':102.08, 'mobile':63.638}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0e673947814991':{'desktop':83.8595, 'mobile':228.603}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0e6eb783023591':{'desktop':213.98, 'mobile':454.909}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0e781780606551':{'desktop':162.601, 'mobile':136.849}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0e7f7086839842':{'desktop':68.9, 'mobile':572.952}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0e872376685376':{'desktop':323.523, 'mobile':1594.01}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0e8e0810422724':{'desktop':417.224, 'mobile':649.341}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0e959930963341':{'desktop':356.703, 'mobile':1090.84}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0e9d0931933948':{'desktop':341.327, 'mobile':718.342}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0ea4e504103709':{'desktop':468.603, 'mobile':958.659}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0eac2572156109':{'desktop':572.58, 'mobile':56.7}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0eb3c438071007':{'desktop':666.281, 'mobile':1153.5}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0ebbc943943961':{'desktop':605.76, 'mobile':572.927}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0ec2e262370859':{'desktop':587.575, 'mobile':1221.02}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0ece9466107312':{'desktop':717.66, 'mobile':1466.91}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0ed6e356137138':{'desktop':821.927, 'mobile':1082.22}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0ede9315277322':{'desktop':915.628, 'mobile':1669.39}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0ee64132816411':{'desktop':855.107, 'mobile':2128.16}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0eede135128447':{'desktop':836.922, 'mobile':1762.76}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0ef71024869399':{'desktop':967.007, 'mobile':1994.49}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0eff2453865709':{'desktop':1076.86, 'mobile':2110.16}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0f085065260250':{'desktop':1170.56, 'mobile':2199.98}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0f103517817339':{'desktop':1110.04, 'mobile':1606.39}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0f17d448888896':{'desktop':1091.89, 'mobile':2290.52}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0f210180686130':{'desktop':1221.94, 'mobile':2516.29}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0f29a017091650':{'desktop':17.82, 'mobile':14.35}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0f337322952703':{'desktop':151, 'mobile':134.187}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0f3eb504122625':{'desktop':170, 'mobile':219.702}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0f497182425263':{'desktop':244, 'mobile':134.227}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0f53d429195942':{'desktop':311, 'mobile':453.971}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0f5e3506855135':{'desktop':383.5, 'mobile':317.158}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0f688036414745':{'desktop':527.5, 'mobile':375.608}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0f733463952591':{'desktop':31.204, 'mobile':13.4608}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0f7de506952109':{'desktop':252, 'mobile':179.267}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0f89b772564813':{'desktop':252, 'mobile':179.225}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0f96f773207546':{'desktop':252, 'mobile':179.281}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0fa38937906975':{'desktop':297, 'mobile':241.349}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0fb04844206188':{'desktop':346.5, 'mobile':304.007}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0fbbf214210671':{'desktop':396, 'mobile':358.963}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0fcaf250348318':{'desktop':441, 'mobile':391.521}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0fe23743307221':{'desktop':579, 'mobile':506.55}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0fecf219729498':{'desktop':252, 'mobile':229.944}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d0ff9d486119074':{'desktop':14.5038, 'mobile':-4.983}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d1005c644939343':{'desktop':101.1, 'mobile':384.201}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d100f2918858606':{'desktop':171.1, 'mobile':449.125}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d10179750103136':{'desktop':243.803, 'mobile':506.726}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d10218002470167':{'desktop':428, 'mobile':657.26}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d105ee353255145':{'desktop':90.125, 'mobile':791.984}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d106a3753544728':{'desktop':80, 'mobile':41.5938}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d10750021885737':{'desktop':141, 'mobile':96.375}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d10843378187095':{'desktop':31.5, 'mobile':20.143}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d1090e616222704':{'desktop':241, 'mobile':170}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d109be411660433':{'desktop':243, 'mobile':857.243}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d10a5d296748502':{'desktop':243, 'mobile':513.613}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d10b0a400854912':{'desktop':264, 'mobile':874.032}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d10c0c150078607':{'desktop':264, 'mobile':532.519}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d10cec150554130':{'desktop':264, 'mobile':191}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d10dbb162721892':{'desktop':378, 'mobile':296.102}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d10e7c898001797':{'desktop':378, 'mobile':637.019}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d10f33311043919':{'desktop':378, 'mobile':970.01}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d10fd9201758509':{'desktop':417.602, 'mobile':347.209}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d11099231172960':{'desktop':417.602, 'mobile':697.024}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d1114d781954490':{'desktop':411.5, 'mobile':1043.22}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d11252472072686':{'desktop':0, 'mobile':17}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d1136d663978414':{'desktop':77.9122, 'mobile':257.23}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d114fe055565217':{'desktop':106.5, 'mobile':84}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d116d2843282789':{'desktop':9.101, 'mobile':30.648}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d117af441862639':{'desktop':11.2385, 'mobile':6.266}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d11891546920422':{'desktop':66.805, 'mobile':62.407}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d1196b906462571':{'desktop':316.5, 'mobile':582.315}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d11b7f395897403':{'desktop':73.3, 'mobile':342.178}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d122a2980793840':{'desktop':14.5038, 'mobile':-4.983}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d1238b257266073':{'desktop':101.1, 'mobile':383.24}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d12444053141244':{'desktop':171.1, 'mobile':432.28}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d124f6491804360':{'desktop':236.803, 'mobile':499.496}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d12598395809046':{'desktop':428, 'mobile':642.96}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d1266c245353382':{'desktop':316.5, 'mobile':566.715}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496794969cbdc8d12767511251531':{'desktop':73.3, 'mobile':346.678}});elementos_posicao = Object.assign(elementos_posicao,{'e_3191492_1_177496798520062746':{'desktop':620.164, 'mobile':619.893}});blocos_posicao = Object.assign(blocos_posicao,{'b_3191492_1_177496794969cbdc8d0ca68':{'desktop':751.977, 'mobile':1039.68}});blocos_posicao = Object.assign(blocos_posicao,{'b_3191492_1_177496794969cbdc8d0ca8d':{'desktop':746.977, 'mobile':640}});blocos_posicao = Object.assign(blocos_posicao,{'b_3191492_1_177496794969cbdc8d0ca91':{'desktop':599.195, 'mobile':660.18}});blocos_posicao = Object.assign(blocos_posicao,{'b_3191492_1_177496794969cbdc8d0ca94':{'desktop':750, 'mobile':1675.7}});blocos_posicao = Object.assign(blocos_posicao,{'b_3191492_1_177496794969cbdc8d0ca98':{'desktop':1037, 'mobile':1582.36}});blocos_posicao = Object.assign(blocos_posicao,{'b_3191492_1_177496794969cbdc8d0ca9b':{'desktop':1354, 'mobile':2653.76}});blocos_posicao = Object.assign(blocos_posicao,{'b_3191492_1_177496794969cbdc8d0ca9f':{'desktop':677, 'mobile':556.109}});blocos_posicao = Object.assign(blocos_posicao,{'b_3191492_1_177496794969cbdc8d0caa3':{'desktop':715, 'mobile':663.477}});blocos_posicao = Object.assign(blocos_posicao,{'b_3191492_1_177496794969cbdc8d0caa7':{'desktop':565, 'mobile':685.266}});blocos_posicao = Object.assign(blocos_posicao,{'b_3191492_1_177496794969cbdc8d0cab1':{'desktop':652, 'mobile':1205.22}});blocos_posicao = Object.assign(blocos_posicao,{'b_3191492_1_177496794969cbdc8d0cab3':{'desktop':1457.91, 'mobile':1331.93}});blocos_posicao = Object.assign(blocos_posicao,{'b_3191492_1_177496794969cbdc8d0caad':{'desktop':804, 'mobile':1252.56}});blocos_posicao = Object.assign(blocos_posicao,{'b_3191492_1_177496794969cbdc8d0cabf':{'desktop':565, 'mobile':705.266}});blocos_posicao = Object.assign(blocos_posicao,{'b_3191492_1_177496794969cbdc8d0cab5':{'desktop':468, 'mobile':472}});blocos_posicao = Object.assign(blocos_posicao,{'b_3191492_1_177496794969cbdc8d0cab8':{'desktop':112, 'mobile':128}});(function(){if(window.__gLinkInterno)return;window.__gLinkInterno=1;var find=function(b){if(!b)return null;var k=String(b).replace(/^bloco_/,'');return document.querySelector('[data-bid="'+k+'"]')||document.getElementById(b)||document.getElementById('b_'+k)||document.getElementById(k);};document.addEventListener('click',function(e){var a=e.target&&e.target.closest?e.target.closest('.link_interno'):null;if(!a)return;e.preventDefault();var d=a.getAttribute('data-bloco'),m=a.getAttribute('data-bloco-mobile');var t=(window.innerWidth<720&&m)?(find(m)||find(d)):find(d);if(!t)return;var y=t.getBoundingClientRect().top+(window.gScrollTop?window.gScrollTop():(window.pageYOffset||0))-60;if(window.gScrollSet){window.gScrollSet(y,true);}else{window.scroll({top:y,behavior:'smooth'});}},true);})();function InserirScriptsInline(){if(!window.getCrawler()){var _fb = gpages_cfg.fb||{}, _ga = gpages_cfg.ga||{}, _gtm = gpages_cfg.gtm||{};
if(_fb.enabled && _fb.pixel){
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod? n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
let advancedMatching ={'ct':(u?.city || '').toLowerCase(), 'st':(u?.state || '').toLowerCase(), 'country':(u?.country || '').toLowerCase(), 'client_ip_address':u?.ip || '', 'client_user_agent':u?.agent || '', 'fbp':typeof c != 'undefined' ? c :'', 'fbc':typeof fbclid != 'undefined' ? fbclid :''};
if(advancedMatching.fbc == ''){delete advancedMatching.fbc;}
if(advancedMatching.fbp == ''){delete advancedMatching.fbp;}
if(typeof gpages_conversion.em != 'undefined' && gpages_conversion.em != ''){advancedMatching.em = gpages_conversion.em;}
if(typeof gpages_conversion.ph != 'undefined' && gpages_conversion.ph != ''){advancedMatching.ph = gpages_conversion.ph;}
fbq('init',_fb.pixel,advancedMatching);
if(_fb.event_access == 'CustomEvent'){
fbq('trackCustom',_fb.event_access_custom,{},{eventID:eid});
}else if(_fb.event_access == 'Purchase'){
var _cur = (_fb.event_currency==null||_fb.event_currency==='') ? 0 :_fb.event_currency;
fbq('track','Purchase',{currency:''+_cur, value:(Number(_fb.event_value)||0)},{eventID:eid});
}else{
fbq('track',_fb.event_access,{},{eventID:eid});
}
}
if(_gtm.enabled && _gtm.id){
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);if(typeof window.gtag === 'undefined'){window.gtag = function(){window.dataLayer.push(arguments);}}})(window,document,'script','dataLayer',_gtm.id);
}
if(_ga.enabled && _ga.id){
var scripts = document.createElement('script');
scripts.type = 'text/javascript';
scripts.src = 'https://www.googletagmanager.com/gtag/js?id='+_ga.id;
scripts.defer = true;
document.body.appendChild(scripts);
var scripts2 = document.createElement('script');
scripts2.type = 'text/javascript';
scripts2.innerHTML = "window.dataLayer = window.dataLayer || [];window.gtag = function(){dataLayer.push(arguments);};gtag('js', new Date());gtag('config', '"+_ga.id+"');";
document.body.appendChild(scripts2);
}
}if(Array.isArray(gpages_scripts_ativos.funcionamento)){
gpages_scripts_ativos.funcionamento.forEach(function(fn){
var conteudo=fn.toString();conteudo=conteudo.substr(11,conteudo.length);conteudo=conteudo.substr(0,(conteudo.length-1));
var gp_inline=document.createElement('script');gp_inline.text=conteudo;document.body.appendChild(gp_inline);
});
}else if(typeof gpages_scripts_ativos.funcionamento == 'function'){
gpages_scripts_ativos.funcionamento();
}
}var scripts_estatisticas = gpages_scripts_ativos.estatisticas ||{}, scripts_marketing = gpages_scripts_ativos.marketing ||{};
