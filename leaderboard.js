PlayersList = new Mongo.Collection('players');

if(Meteor.isClient){

  Meteor.subscribe('thePlayers');

  Template.leaderboard.helpers({
    'player': function(){
      var currentUserId = Meteor.userId();
      return PlayersList.find({}, {sort: {score: -1, name: 1} }); // Sort by -1 for DESC, sorting by both score and name.
      // Pass {} to explicitly return all items, need to pass in a first argument to pass the second sort.
    },
    'selectedClass': function(){
      var playerId = this._id;
      var selectedPlayer = Session.get('selectedPlayer');
      if(playerId == selectedPlayer){
        return "selected";
      }
    },
    'showSelectedPlayer': function(){
      var selectedPlayer = Session.get('selectedPlayer');
      return PlayersList.findOne(selectedPlayer);
    },
    'showUserEmail': function(){
      var userEmail = Meteor.user().emails[0].address;
      return userEmail;
    }
  });

  Template.leaderboard.events({
    'click .player': function(){
      var playerId = this._id;
      Session.set('selectedPlayer', playerId);
    },
    'click .increment': function(){
      var selectedPlayer = Session.get('selectedPlayer');
      Meteor.call('modifyPlayerScore', selectedPlayer, 1);
    },
    'click .decrement': function(){
      var selectedPlayer = Session.get('selectedPlayer');
      Meteor.call('modifyPlayerScore', selectedPlayer, -1);
    },
    'click .remove': function(){
      var x = confirm("Are you sure you want to delete this player?");
      if(x == true) {
        var selectedPlayer = Session.get('selectedPlayer');
        Meteor.call('removePlayerData', selectedPlayer);
      }
    }
  });

  Template.addPlayerForm.events({
    'submit form': function(event){
      event.preventDefault();
      var playerNameVar = event.target.playerName.value;
      Meteor.call('insertPlayerData', playerNameVar);
      event.target.playerName.value = "";
    }
  });
}


if(Meteor.isServer){
  Meteor.publish('thePlayers', function(){
    var currentUserId = this.userId;
    return PlayersList.find({createdBy: currentUserId});
  });

  Meteor.methods({
    'insertPlayerData': function(playerNameVar){
      var currentUserId = Meteor.userId();
      PlayersList.insert({
        name: playerNameVar,
        score: 0,
        createdBy: currentUserId
      });
    },

    'removePlayerData': function(selectedPlayer){
      var currentUserId = Meteor.userId();
      PlayersList.remove({_id: selectedPlayer, createdBy: currentUserId});
      // This method will only allow a player to be removed if that player belongs to the current user.
      // If I call .remove(selectedPlayer) only, that will allow users to delete other users' data.
    },

    'modifyPlayerScore': function(selectedPlayer, amount){
      var currentUserId = Meteor.userId();
      PlayersList.update( {_id: selectedPlayer, createdBy: currentUserId}, {$inc: {score: amount}} );
      // Be careful of update! By default, it'll delete the document that's being updated and recreate it with the new specified fields!
      // Use $set operator to only change the values you specify.
      // $inc is for incrementing and decrementing the value.
    }

  });
}