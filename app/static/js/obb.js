$(document).ready(function() {

  $('#submitcode').click(function() {
    closeAlert();

    if(!$('input[name=code]').val().length) {
      makeAlert('Please enter a claim code.','alert');
      return false;
    }
  });

  $('.badgelink').click(function() {
    var target = $(this);

    var detail = target.closest('.badgethumb');
    var href = detail.attr('href');
    window.location.href = href;
    return false;

  });

  $('#apply-form').on('submit', submitApplication);

  //the click function for lists of badge thumbnails
  $( 'body' ).delegate( "a", "click", function() {
    closeAlert();

    var target = $( this );

    //close reveal
    if (target.hasClass('closereveal')) {
      $('#reveal').foundation('reveal', 'close');
    }

    //Display badge content and BadgeUI for clicked badge
    if (target.hasClass('badgethumb')) {
      //for square thumbnail badges
      if(target.parents('ul').hasClass('square')){
        var detail = target.find('.detail');
        if (target.hasClass('chosen')) {
          detail.fadeOut('fast');
          target.removeClass('chosen');
        } else {
          detail.fadeIn('fast');
          target.addClass('chosen');
        }
      }

      //check for other chosen items and close them
      if($('.chosen').length > 0 ) {
        $('.chosen').each(function(){
          var thisTarget = $(this);
          if (target[0] !== thisTarget[0]) {
            var detail = thisTarget.find('.detail');
            detail.fadeOut('fast');
            thisTarget.removeClass('chosen');
          }
        });
      }

      return false;
      //Perform action based on clicked Badge UI item
    }
  });


  function closeAlert() {
    if($('.alert-box').length != 0) {
      $('.alert-box').remove();
    }
  }

  //a function to create an alert box element and add to the DOM
  function makeAlert(text,status) {
    closeAlert();
    var alert = '<div data-alert class="alert-box ' + status + '"><span class="content">' + text + '</span><a href="#" class="close">&times;</a></div>';
    $(alert).prependTo($('body')).fadeIn('fast');
  }

  function submitApplication() {
    var form = $(this);
    var feedback = form.find('#apply-feedback');
    $.ajax({
      url: form.attr('action'),
      type: 'POST',
      data: form.serialize(),
      success: function(data, status, xhr) {
        form.find('input, textarea, button').attr('disabled', 'disabled');
        feedback.html(data);
        form.find('button').hide();
      },
      error: function(xhr, status, error) {
        feedback.html(xhr.responseText);
      }
    });

    return false;
  }
});
