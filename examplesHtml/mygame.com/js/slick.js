$(function () {
  $('.gallery__list').slick({
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    variableWidth: true,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 1000,
    dots: false,
    centerMode: true,
    cssEase: 'linear',
    prevArrow: '.gallery__button--left',
    nextArrow: '.gallery__button--right',
  });
});

$(function () {
  if (window.innerWidth < 1200) {
    $('.advantages__list').slick({
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      variableWidth: true,
      autoplay: true,
      autoplaySpeed: 3500,
      cssEase: 'linear',
      prevArrow: '.advantages__button--left',
      nextArrow: '.advantages__button--right',
    });
  }
});

$(function () {
  if (window.innerWidth < 1440) {
    $('.reviews__list').slick({
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      variableWidth: true,
      autoplay: true,
      autoplaySpeed: 3000,
      centerMode: true,
      cssEase: 'linear',
      prevArrow: '.reviews__button--left',
      nextArrow: '.reviews__button--right',
    });
  }
});
