$(document).ready(function(){
  $('.delete-contact').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    $.ajax({
      type:'DELETE',
      url: '/contact/'+id,
      success: function(response){
        alert('Deleting Contact');
        window.location.href='/';
      },
      error: function(err){
        console.log(err);
      }
    });
  });
});
