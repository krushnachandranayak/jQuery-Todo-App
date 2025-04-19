function loadView(URL) {
    $.ajax({
        method: 'get',
        url: URL,
        success: (response) => {
            $("section").html(response);
        }
    });
}

//All jQuery Load Actions
$(() => {

    if($.cookie('uname')){
        loadDashBoard();
    }else{
        loadView('./home.html');
    }
    $(document).on('click', '#btn-home-register', () => {
        loadView("./register.html");
    })

    $(document).on('click', '#btn-home-login', () => {
        loadView("./login.html");
    })

    $(document).on('click', '#btn-home', () => {
        loadView("./home.html");
    })


    //verify user name
    $(document).on('keyup', '#txtUsername', () => {
        $.ajax({
            method: 'get',
            url: 'http://localhost:4040/users',
            success: (users) => {
                for (var user of users) {
                    if ($('#txtUsername').val().length == 0) {
                        $('#lblUserError').html('User Name is required').css('color', 'red');
                    }
                    else if (user.username === $('#txtUsername').val()) {
                        $('#lblUserError').html('User Name taken - Try another').css('color', 'red');
                        break;
                    }
                    else {
                        $('#lblUserError').html('User Name Available').css('color', 'green');
                    }
                }

            }
        })
    })

    //verify password
    $(document).on('keyup', '#txtPassword', () => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,15}$/;
        if($('#txtPassword').val().length == 0){
            $('#lblPwdError').html('Password is required').css('color', 'red');
        }else if (regex.test($('#txtPassword').val())) {
            if ($('#txtPassword').val().length < 10) {
                $('#lblPwdError').html('Week Password').css('color', 'yellow');
            }else if ($('#txtPassword').val().length > 10) {
                $('#lblPwdError').html('Strong Password').css('color', 'green');
            }
        }
        else {
            $('#lblPwdError').html('Password must contain one Uppercase and lowercase letter, a Number and special character [@,$,!,%,*,?,&]').css('color', 'red');
        }
    })

    //verify email
    $(document).on('keyup', '#txtEmail', () => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if ($('#txtEmail').val().length == 0) {
            $('#lblEmailError').html('Email is required').css('color', 'red');
        } else if (regex.test($('#txtEmail').val())) {
            $('#lblEmailError').html('Email verified').css('color', 'green');
        } else {
            $('#lblEmailError').html('Enter a valid Email!').css('color', 'red');
        }
    })

    //register user
    $(document).on('click', '#btnRegister', () => {
        var user = {
            username: $('#txtUsername').val(),
            password: $('#txtPassword').val(),
            email: $('#txtEmail').val()
        }
        $.ajax({
            method: 'post',
            url: 'http://localhost:4040/register-user',
            data: user,
            success: () => {
                console.log('User Registered Successfully!');
                loadView("./home.html");
            }
        })
    })


    //login user
    $(document).on('click', '#btnLogin',()=>{
        if($('#txtUsername').val().length == 0){
            $('#lblUserMsg').html('Username Required').css('color','red');
        } else if($('#txtPassword').val().length ==0){
            $('#lblUserMsg').html('');
            $('#lblPwdMsg').html('Password Required').css('color','red');
        }else{
            $('#lblPwdMsg').html('');
            $.ajax({
                method: 'get',
                url: 'http://localhost:4040/users',
                success: (users)=>{
                    var user = users.find(item=> item.username === $('#txtUsername').val());
                    if(user){
                        $('#lblUserMsg').html('');
                        if(user.password === $('#txtPassword').val()){
                            $.cookie('uname', $('#txtUsername').val(), { expires: 1 });
                            loadDashBoard();
                        } else {
                            $('#lblPwdMsg').html('Invalid Password').css('color','red');
                        }
                    } else {
                        $('#lblUserMsg').html('Invalid Username').css('color','red');
                    }
                }
            })
        }
    })

    function loadDashBoard(){
        $.ajax({
            method: 'get',
            url: './dashboard.html',
            success: (response) => {
                $("section").html(response);
                $('#active-user').html($.cookie('uname'));
                $.ajax({
                    method: 'get',
                    url: 'http://localhost:4040/appointments',
                    success: (appointments)=>{
                        var results = appointments.filter(item=> item.username === $.cookie('uname'));
                        results.map(appointment =>{
                            $(`<div class="alert alert-success">
                                <h3>${appointment.title}</h3>
                                <p>${appointment.description}</p>
                                <div class="bi bi-calendar"> ${appointment.date.substring(0,appointment.date.indexOf('T'))} </div>
                                <div>
                                  <button id="btn-edit" value=${appointment.appointment_id} data-bs-target="#edit-appointment" data-bs-toggle="modal" class="bi bi-pen-fill btn btn-warning mt-2"></button>
                                  <button id="btn-delete" value=${appointment.appointment_id} class="bi bi-trash-fill btn btn-danger mx-2 mt-2"></button>
                                </div>
                            </div>`).appendTo("#appointment-cards");
                        })
                    }
                })
            }
        })
    }
    // Signout Click
    $(document).on('click', '#btn-signout', ()=>{
        $.removeCookie('uname');
        alert('User Signout Successfully!');
        console.log('User Sign-out');
        loadView('./home.html');
    })


    //Add Appointment Click

    $(document).on('click','#btn-add',()=>{
        var appointment ={
            id:parseInt($('#appointment-id').val()),
            title:$('#appointment-title').val(),
            description:$('#appointment-description').val(),
            date:$('#appointment-date').val(),
            username:$.cookie('uname')
        }

        $.ajax({
            method:'post',
            url:'http://localhost:4040/add-appointment',
            data:appointment,
        });
        loadDashBoard();
    })

    //Delete Appointment

    $(document).on('click','#btn-delete',(e)=>{
        var flag = confirm('Are you sure?\n Want to delete?');
        if(flag===true){
            $.ajax({
                method:'delete',
                url:`http://localhost:4040/delete-appointment/${e.target.value}`
            });

            loadDashBoard();
        }
    })

    //Edit Appointment
    $(document).on('click','#btn-edit', (e)=>{
        $.ajax({
            method:'get',
            url:`http://localhost:4040/appointments/${e.target.value}`,
            success:(appointment)=>{
                $("#edit-appointment-id").val(parseInt(appointment.appointment_id));
                $("#edit-appointment-title").val(appointment.title);
                $("#edit-appointment-description").val(appointment.description);
                $("#edit-appointment-date").val(appointment.date.substring(0,appointment.date.indexOf('T')));
            }
        })
    })

    //Update & save Appointment
    $(document).on('click','#btn-save',()=>{
        var appointment = {
            id: parseInt($("#edit-appointment-id").val()),
            title: $("#edit-appointment-title").val(),
            description: $("#edit-appointment-description").val(),
            date: $("#edit-appointment-date").val(),
            username: $.cookie('uname')
        }

        $.ajax({
            method:'put',
            url:`http://localhost:4040/edit-appointment/${$("#edit-appointment-id").val()}`,
            data:appointment
        });
        loadDashBoard();
    })
});