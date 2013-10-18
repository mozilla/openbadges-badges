$(document).ready(function() {

  $('.submitcode').click(function() {
    closeAlert();

    if(!$('input[name=code]').val().length) {
      makeAlert('Please enter a claim code.','alert');
      return false;
    }
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
      //check for other chosen items and close them
      if($('.chosen').length > 0 ) {
        $('.chosen').each(function(){
          var thisTarget = $(this);
          thisTarget.find('.detail').animate({
            top: "150px"
          }, 400, "swing", function(){
            thisTarget.removeClass('chosen').parents('li').find('.ui').fadeOut('fast', function() {
              $(this).remove();
            });
          });
        });
      }

      //for square thumbnail badges
      if(target.parents('ul').hasClass('square')){
        if (target.hasClass('chosen')) {
          target.find('.detail').animate({
            top: "150px"
          }, 400, "swing", function(){
            target.removeClass('chosen').parents('li').find('.ui').fadeOut('fast', function() {
              $(this).remove();
            });
          });
        } else {
          target.find('.detail').animate({
            top: "0px"
          }, 400, "swing", function(){
            var ui = makeUI(target)
            target.addClass('chosen').parents('li').append(ui).find('.ui').fadeIn('fast');
          });
        }
      }
      return false;
      //Perform action based on clicked Badge UI item
    }
  });

  //a function to generate the dropdown BadgeUI from the clicked badge hash
  function makeUI(element) {
    var href = element.attr('href');
    var output = '<div class="badgeui ui"><ul><li><a class="badge_action bapp button small" href="' + href + '">View</a></li></ul></div>';

    return output;
  }

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
        form.find('input, textarea').attr('disabled', 'disabled');
        feedback.html(data);
        form.find('input.button').hide();
      },
      error: function(xhr, status, error) {
        feedback.html(xhr.responseText);
      }
    });

    return false;
  }
});
