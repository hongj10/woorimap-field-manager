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
});

// 퀵메뉴 접기/펼치기
$(function () {
  var quick = $(".btn-fold");
  quick.on("click", function () {
    $(this).parent().toggleClass("active");
  });
});

const statChange = function(e){
	let id = e.id;
	if(!$(e).hasClass('active')){
    console.log(id)
		let targetData = $(`#${id}Data`);
		$('.statItem').not(targetData).hide();
		$('.changeItem').not(targetData).removeClass('active')
		targetData.show();
		$(e).addClass('active');
	}	
}

const layerVisble = (evt) => {
  const changedLayer = map.getAllLayers().find((layer)=>layer.values_.id==evt.value)
  changedLayer.setVisible(!changedLayer.getVisible())
}