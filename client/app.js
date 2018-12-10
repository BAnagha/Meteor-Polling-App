Router.configure({
  layoutTemplate: 'main'
});

Template.user.helpers({
  'polls': function(){
    var currentUser = Meteor.userId();
    return Polls.find({ createdBy: currentUser }, {sort: {name: 1}}).fetch();
}
});


Template.poll.helpers({
  question(){
    return Template.parentData().poll.question;
  },
  choices(){
    return Template.parentData().poll.choices;
  }
});

Template.pollCount.helpers({
  'totalPolls': function(){
    var currentUser = Meteor.userId();
    return Polls.find({ createdBy: currentUser }, {sort: {name: 1}}).count();
  }
});

Template.pollForm.events({

  // handle the form submission
  'submit form': function(event) {

    // stop the form from submitting
    event.preventDefault();
    var question = $('[name="question"]').val();
    var currentUser = Meteor.userId();

    // get the data we need from the form
    var newPoll = {
      question: event.target.question.value,
      choices: [
        {  text: event.target.choice1.value, votes: 0 },
        {  text: event.target.choice2.value, votes: 0 },
        {  text: event.target.choice3.value, votes: 0 }
      ]
    };    
    
    // create the new poll
    
    Polls.insert({
      poll: newPoll,
      createdBy: currentUser,
      voters : []
  }, function(error, results){
      Router.go('user', { _id: results });
  });
    $('[name="question"]').val('');
    event.target.choice1.value = "";
    event.target.choice2.value = "";
    event.target.choice3.value = ""; 
  }

});



    // attach events to our poll template
Template.poll.events({

  // event to handle clicking a choice
  'click .vote': function(event) {
    console.log('in vote');
    // prevent the default behavior
    var voters = Template.parentData().voters;
    event.preventDefault();
    var voteID = $(event.currentTarget).data('id');
    // create the incrementing object so we can add to the corresponding vote
    var voteString = 'poll.choices.' + voteID + '.votes';
    var action = {};
    action[voteString] = 1;

    //  if (_.contains(voters, Meteor.userId()))
    // {
    //   console.log('inside if');
    // throw new Meteor.Error('invalid', 'Already voted this post');
    // }

    console.log('voteString :: '+ voteString);
    // increment the number of votes for this choice
    Polls.update(
      { _id: Template.parentData()._id }, 
      //{ $addToSet : {"voters": Meteor.userId()}},
      { $inc: action }
    );

    console.log( Polls.find({ createdBy: Meteor.userId() }).fetch());
  },
  'click .delete-poll': function(event){
    event.preventDefault();
    var documentId = Template.parentData()._id;
     var confirm = window.confirm("Delete this poll?");
     if(confirm){
      Polls.remove({ _id: documentId });
     }
  }
});


/* code for Register and Login */
Template.register.events({
  'submit form': function(event){
      event.preventDefault();
      var email = $('[name=email]').val();
      var password = $('[name=password]').val();
      // var currentUser= Meteor.userId();
      Accounts.createUser({
          email: email,
          password: password
      }),
      //function(error){
        //if(error){
          //console.log(error.reason); // Output error if registration fails
      //} else {
          
          //Router.go("user"); // Redirect user if registration succeeds
      //}
      //}
      Router.go('user');
  }
});
Template.navigation.events({
  'click .logout': function(event){
      event.preventDefault();
      Meteor.logout();
      Router.go('home');
  }
});
Template.login.events({
  'submit form': function(event){
      event.preventDefault();
      var email = $('[name=email]').val();
      var password = $('[name=password]').val();
      Meteor.loginWithPassword(email, password, function(error){
        if(error){
          console.log(error.reason);
          } else {
            
          Router.go("user");
      }
      });
  }
});

UI.registerHelper('indexedArray', function(context, options) {
  if (context) {
    return context.map(function(item, index) {
      item._index = index;
      return item;
    });
  }
});
/* rendering routes for iron router */
Router.route('/', function () {
  this.render('home');  
},{
    name: 'home'
});

Router.route('/register', function () {
  this.render('register');  
},{
    name: 'register'
});
Router.route('/login', function () {
  this.render('login');  
},{
    name: 'login'
});
Router.route('/user', function () {
  this.render('user');  
},{
    name: 'user'
});

Router.route('/logout', function () {
  this.render('logout');  
},{
    name: 'logout'
});