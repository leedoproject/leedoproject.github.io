$.lang = {};
let nav_lang = undefined;
if (navigator.language === "ko-KR" || navigator.language === "ko") {
  nav_lang = "ko";
} else {
  nav_lang = "en";
}
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
}

function getCurLang() {
  return lang;
}
