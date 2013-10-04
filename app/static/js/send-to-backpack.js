$(document).ready(function() {

  $('#send-button').click(function() {
    var url = $(this).attr('data-assertion-url');
    openPushTab([url]);
  });

  // ripped this out of Issuer API's issuer.js, to add the target="_blank"
  function openPushTab(assertions) {
    assertions = typeof assertions === 'string' ? [assertions] : assertions;
    var url = 'http://backpack.openbadges.org/issuer/frameless?' + Date.now();
    var form = $('<form method="POST" target="_blank"></form>').attr('action', url).appendTo($('body')).hide();
    assertions.forEach(function(val, i, arr){
      $('<input type="text" name="assertions">').val(val).appendTo(form);
    });
    form.submit();
  }
});