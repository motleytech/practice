// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//







$(function () {
  $('[data-toggle="tooltip"]').tooltip();

  // This is the auto-complete box
  $("#autocomplete").autocomplete({
    source: '/users/autocomplete.json',
    minLength: 2,
    select: function(event, ui){
      window.location.href = "/users/" + ui.item.id;
    }
  })
  .autocomplete( "instance" )._renderItem = function(ul, item) {
  return $("<li>")
    .append("<a>")
    .append("<img class='small-avatar-image' src='" + item.avatar_url + "''></img> ")
    .append(item.label + "</a>")
    .appendTo(ul);
  };

  // Use the jquery lazy load library to only load images once they are in the view
  $("img.lazy").lazyload({effect : "fadeIn"});
});
