// For the Update button in details

$('#updateForm_container').hide();

$('#updateBtn').click(() => {
    $('#updateForm_container').toggle();
});

// For the Drop Button

$('#dropbtn').click(() => {
    $('#nav-content a').slideToggle('slow');
});
