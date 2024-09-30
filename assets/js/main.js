jQuery(document).ready(function(){
  svg4everybody();
  $(".icon-hamburger").on('click', function(event){
    $(".site-navigation").toggleClass('active');
    if($(".container-search-main").hasClass('active'))
      $(".container-search-main").toggleClass('active');
  });

  $(".icon-cross").on('click', function(event){
    $(".site-navigation").toggleClass('active');
  });

  $(".icon-search").on('click', function(event){
    $(".container-search-main").toggleClass('active');
    if($(".site-navigation").hasClass('active'))
      $(".site-navigation").toggleClass('active');
  });

  $('.anchor').click(function(e){
    e.preventDefault();
    setTimeout(function(){
      $('body,html').animate({scrollTop:$('#top').offset().top},500);
    }, 100);
  });

});
