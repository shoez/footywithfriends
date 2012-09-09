footy = {
    init: function () {
        // Get user
        //this.getUser();

        // Invite submit handler
        $("#form-invite").on("submit", this.submitInvite);

        // Save bet submit handler
        $("#form-save-bet").on("submit", this.submitBet);

        // Setup page handlers
        $( document ).delegate("#page-matches", "pagebeforecreate", function() {
            // Get list of pages
        });
        $( document ).delegate("#page-friends", "pagebeforecreate", function() {
            // Get list of friends
        });

        // Init listeners
        this.setupListeners();
    }
};

footy.submitInvite = function(e) {
    e.stopPropagation();
    $.mobile.changePage( "#page-match", { transition: "slide"} );
    return false;
};

footy.submitBet = function(e, data) {
    e.stopPropagation();
    var form = $(e.target);
        startTime = form.find("input[name='start-time']").val();
        endTime = new Date().getTime(),
        duration = (startTime - endTime) / 1000;

    $.mobile.changePage( "#page-match", { transition: "pop"} );
    return false;
};

footy.setupListeners = function() {
    var id = 100;
    var client = new Faye.Client('http://localhost:8000/faye');

    var Logger = {
      incoming: function(message, callback) {
        console.log('incoming', message);
        callback(message);
      },
      outgoing: function(message, callback) {
        console.log('outgoing', message);
        callback(message);
      }
    };

    //client.addExtension(Logger);

    client.subscribe('/competition/' + id + '/events/quiztime', function (data) {
        var node = $("#dialog-quiz .question").empty();
            quiz = data.quiz;
        if (quiz) {
            var question = $("<p>" + quiz.question + "</p>").appendTo(node),
                startTime = $("<input name='start-time' type='hidden'></input>").appendTo(node),
                fieldset = $("<fieldset></fieldset>").appendTo(node);
            
            fieldset.attr("data-role", "controlgroup");
            startTime.attr({name: "startTime", value: new Date().getTime()});

            if (quiz.type === "multiple") {
                if (quiz.options.length > 4) {
                    // Select if more than 4 options
                } else {
                    //fieldset.attr("data-type", "horizontal");
                    $.each(quiz.options, function(index, value) {
                        $("<input></input>")
                            .attr({
                                id: "r-" + index,
                                type: "radio",
                                name: "answer",
                                value: value
                            })
                            .appendTo(fieldset);

                        $("<label></label>")
                            .html(value)
                            .attr("for", "r-" + index)
                            .appendTo(fieldset);
                    });
                }
            }
        }
        node.trigger( "create" );
        $.mobile.changePage( "#dialog-quiz", {} );
    });


    client.subscribe('/competition/' + id + '/user/USERID', function (data) {
      console.log('Will log potential score that can be won', data.potentialScore);
    });

    console.log('subscribe to game start');
    var start = client.subscribe('/competition/' + id + '/events/game/start', function (data) {
      console.log(data);
    });
    start.callback(function() {
      console.log('Subscription is now active!');
    });

    client.subscribe('/competition/' + id + '/events/game/stop', function (data) {
      console.log(data);
    });
    client.subscribe('/competition/' + id + '/events/halftime/stop', function (data) {
      console.log(data);
    });
    client.subscribe('/competition/' + id + '/events/halftime/start', function (data) {
      console.log(data);
    });
};
