$.lang = {};

let nav_lang = undefined;

let lang_value = location.href.split("?");
if (lang_value.length > 1) {
  nav_lang = lang_value[1];
  // console.log("lang_value[1] =>", lang_value[1]);
} else {
  // console.log("navigator.language =>", navigator.language);

  if (navigator.language === "ko-KR" || navigator.language === "ko") {
    nav_lang = "ko";
  } else {
    nav_lang = "en";
  }
}

console.log("nav_lang =>", nav_lang);
let lang = nav_lang;

const lng_ko = lang_ko;
const lng_en = lang_en;
$.lang.ko = lng_ko;
$.lang.en = lng_en;

//start
console.log("lang =>", lang);
setLanguage(lang);

function setLanguage(currentLanguage) {
  //console.log("setLanguage", arguments);
  //console.log(arguments[0])

  $("[data-langNum]").each(function () {
    var $this = $(this);
    $this.html($.lang[currentLanguage][$this.data("langnum")]);
  });
}

function selectLang(_lang) {
  // console.log("selectLang =>", _lang);
  lang = _lang;
  setLanguage(_lang);
  setPagePath(_lang);
}

function getCurLang() {
  return lang;
}
