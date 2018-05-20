function deleteUser(obj) {
  console.log(obj.dataset.id);
  var confirmation = confirm('Are you sure ?');
  if (confirmation) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", "/users/delete/" + obj.dataset.id, true);
    xhttp.send();
  } else {
    return false;
  }
}