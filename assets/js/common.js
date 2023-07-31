// 모바일 메뉴
$(window).load(function () {
  $(".hamburger, .nav-close").click(function () {
    $(".hamburger, .nav-overlay, .m-nav, .nav-close").toggleClass("active");
    if ($(".nav-overlay").hasClass("active")) {
      $(".nav-overlay").fadeIn();
    } else {
      $(".nav-overlay").fadeOut();
    }
  });
});

// 가장위로 버튼
(function ($) {
  "use strict";
  $(document).ready(function () {
    $(window).scroll(function () {
      if ($(this).scrollTop() > 100) {
        $(".scrollup").fadeIn();
      } else {
        $(".scrollup").fadeOut();
      }
    });
    $(".scrollup").click(function () {
      $("html, body").animate({ scrollTop: 0 }, 500);
      return false;
    });
  });
})(jQuery);

// 툴팁
$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip();
});

// Lightbox
$(document).on("click", '[data-toggle="lightbox"]', function (event) {
  event.preventDefault();
  $(this).ekkoLightbox();
});

// Chatbox
$(document).ready(function () {
  // 닫기, 열기
  $(".chat-close").click(function (c) {
    return c.preventDefault(), $(".chatbox").css({ opacity: "0" }).hide(), !1;
  }),
    $(".open-chat").click(function (c) {
      return (
        c.preventDefault(),
        $(".chatbox")
          .css({ opacity: "0", display: "block" })
          .show()
          .animate({ opacity: 1 }),
        !1
      );
    });

  // 스크롤 : P.I 서비스상담 채팅창
  $(".conversation-list").slimScroll({
    width: "100%",
    height: "100%",
    railVisible: true,
    wheelStep: 10,
    allowPageScroll: false,
    disableFadeOut: false,
  });

  // 스크롤 : 알림
  $(".noti-list").slimScroll({
    width: "100%",
    height: "100%",
    railVisible: true,
    wheelStep: 10,
    allowPageScroll: false,
    disableFadeOut: false,
  });

  // 스크롤 : 이용약관
  $(".policy-scroll").slimScroll({
    width: "100%",
    height: "100%",
    railVisible: true,
    wheelStep: 10,
    allowPageScroll: false,
    disableFadeOut: false,
  });

  // 스크롤 : 지도서비스 (왼쪽영역)
  $(".left-area .body").slimScroll({
    width: "100%",
    height: "calc(100vh - 210px)",
    railVisible: true,
    wheelStep: 10,
    allowPageScroll: false,
    disableFadeOut: false,
  });

  // 스크롤 : 지도서비스 (오른쪽영역)
  $(".right-area .body").slimScroll({
    width: "100%",
    height: "calc(100vh - 230px)",
    railVisible: true,
    wheelStep: 10,
    allowPageScroll: false,
    disableFadeOut: false,
  });
});

// 퀵메뉴 접기/펼치기
$(function () {
  var quick = $(".btn-fold");
  quick.on("click", function () {
    $(this).parent().toggleClass("active");
  });
});

// 지도서비스 닫기/펼치기
$(function () {
  var left = $(".left-area");
  var fold = $(".left-area .btn-fold");
  fold.click(function () {
    if (left.css("left") == "-350px") {
      left.animate({ left: "20px" }, 300);
      fold.removeClass("active");
    } else {
      left.animate({ left: "-350px" }, 300);
      fold.addClass("active");
    }
  });
  var right = $(".right-area");
  var fold = $(".right-area .btn-fold");
  fold.click(function () {
    if (right.css("right") == "-380px") {
      right.animate({ right: "20px" }, 300);
      fold.removeClass("active");
    } else {
      right.animate({ right: "-380px" }, 300);
      fold.addClass("active");
    }
  });
});

// 지도서비스 길찾기 - 대중교통
$(document).on("click", ".route-bus .wrap", function () {
  $(this).next().slideToggle(".list");
  $(this).parent().toggleClass("active");
  $(this).parent().siblings().removeClass("active");
  $(this).parent().siblings().find(".list").slideUp();
  return false;
});
