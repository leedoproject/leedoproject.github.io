$(function () {
  let header = document.querySelector("#header");
  let headerHeight = header.offsetHeight;

  window.onscroll = function () {
    let windowTop = window.scrollY;
    if (windowTop >= headerHeight) {
      header.classList.add("fixed");
    } else {
      header.classList.remove("fixed");
    }
  };
});

$(function () {
  $(".snb>ol>li>a").click(function () {
    $("html, body").animate(
      {
        scrollTop: $($.attr(this, "href")).offset().top,
      },
      500
    );
    return false;
  });
});

//FAQ Accordion
$(".que").click(function () {
  if ($(this).next(".anw").is(":visible")) {
    $(this).next(".anw").stop().slideUp(300);
  } else {
    $(".anw").stop().slideUp(300);
    $(this).next(".anw").stop().slideDown(300);
  }
});

window.counter = function () {
  // this refers to the html element with the data-scroll-showCallback tag
  var span = this.querySelector("span");
  var current = parseInt(span.textContent);

  span.textContent = current + 1;
};

document.addEventListener("DOMContentLoaded", function () {
  var trigger = new ScrollTrigger({
    addHeight: true,
  });
});
