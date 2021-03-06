footy = {
    //SERVER: "http://3tqq.localtunnel.com",
    //FAYESERVER: "http://52n8.localtunnel.com/faye",
    SERVER: "http://localhost:8080",
    FAYESERVER: "http://localhost:8000/faye",
    TIMERINTERVAL: 5000,
    init: function () {
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
        $( document ).delegate("#page-match", "pagebeforecreate", function() {
            // Get match details
        });

        // Get user
        this.getUser();
    }
};

footy.getUser = function() {
    var self = this;
    $.ajax(this.SERVER + "/user/register", {
        dataType: "jsonp"
    }).always(function(resp, status, xhr) {
        if (resp && resp.uuid) {
            self.userId = resp.uuid;
            self.setupListeners();
            //self.matchTimer = window.setInterval(self.updateMatchClock, self.TIMERINTERVAL);
        }
    });
};

footy.submitInvite = function(e) {
    e.stopPropagation();
    $.mobile.changePage( "#page-match", {} );
    return false;
};

footy.submitBet = function(e, data) {
    e.stopPropagation();
    var form = $(e.target);
        answer = (form.find("input[name='answer']:checked").length) ? form.find("input[name='answer']:checked") : form.find("*[name='answer']"),
        startTime = form.find("input[name='startTime']").val();
        endTime = new Date().getTime(),
        timeTaken = (endTime - startTime) / 1000; /* In seconds */

    var r = $.ajax(form.attr("action"), {
        type: "POST",
        dataType: "json",
        //contentType: 'application/json',
        data: {
            uid: form.find("input[name='uid']").val(),
            quizId: form.find("input[name='quizId']").val(),
            timeTaken: timeTaken,
            answer: answer.val()
        }
    }).done(
        function(resp, success, xhr) {
            $.mobile.changePage( "#page-match", {} );
        }
    );
    return false;
};

footy.updateMatchClock = function() {
    var node = $("#match-time"),
        time = node.data("time") || 0;
    time += 1;
    node.text(time).data("time", time);
};

footy.setupListeners = function() {
    var self = this;
    var id = 100;
    var client = new Faye.Client(this.FAYESERVER);

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
        var node = $("#dialog-quiz .question").empty(),
            form = $("#dialog-quiz form"),
            quiz = data.quiz;

        console.log("data", data);

        // Update action
        form.attr("action", self.SERVER + "/competition/" + id);

        if (quiz) {
            var question = $("<p>" + quiz.question + "</p>").appendTo(node),
                startTime = $("<input name='startTime' type='hidden'></input>").appendTo(node),
                quizId = $("<input name='quizId' type='hidden'></input>").appendTo(node),
                uid = $("<input name='uid' type='hidden'></input>").appendTo(node),
                fieldset = $("<fieldset></fieldset>").appendTo(node);
            
            fieldset.attr("data-role", "controlgroup");
            
            // Set values
            startTime.val(new Date().getTime());
            quizId.val(quiz.id);
            uid.val(self.userId);

            if (quiz.type === "binary") {
                fieldset.attr("data-type", "horizontal");
                $.each(quiz.options, function(index, value) {
                        $("<input></input>")
                            .attr({
                                id: "r-" + index,
                                type: "radio",
                                name: "answer",
                                value: index
                            })
                            .appendTo(fieldset);

                        $("<label></label>")
                            .html(value)
                            .attr("for", "r-" + index)
                            .appendTo(fieldset);
                    });
            }
            else if (quiz.type === "multiple") {
                if (quiz.options.length > 4) {
                    // Select if more than 4 options
                    var select = $("<select data-mini='true'></select>").appendTo(fieldset);
                    $.each(quiz.options, function(index, value) {
                        $("<option></option>")
                            .attr({
                                id: "r-" + index,
                                value: index
                            })
                            .text(value)
                            .appendTo(select);
                    });
                } else {
                    //fieldset.attr("data-type", "horizontal");
                    $.each(quiz.options, function(index, value) {
                        $("<input></input>")
                            .attr({
                                id: "r-" + index,
                                type: "radio",
                                name: "answer",
                                value: index
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


    client.subscribe('/competition/' + id + '/user/' + this.userId, function (data) {
        console.log('Will log potential score that can be won', data.potentialScore);
        var node = $("#dialog-result .result").empty();
        if (data.win === true) {
            $("<p>Congratulations! You won " + data.potentialScore + "</p>").appendTo(node);
            $.mobile.changePage( "#dialog-result", {} );
        } else if (data.win === false) {
            $("<p>Sorry! You lost " + data.potentialScore + "</p>").appendTo(node);
            $.mobile.changePage( "#dialog-result", {} );
        }
    });

    var start = client.subscribe('/competition/' + id + '/events/game/start', function (data) {
        console.log(data);
        $("#match-time").text("0").data("time", 0).addClass("active");
        self.matchTimer = window.setInterval(self.updateMatchClock, self.TIMERINTERVAL);
    });
    start.callback(function() {
        console.log('Subscription is now active!');
    });

    client.subscribe('/competition/' + id + '/events/game/stop', function (data) {
        console.log(data);
        $("#match-time").text("Match ended").data("time", 90).removeClass("active");
        if (self.matchTimer) window.clearInterval(self.matchTimer);
    });
    client.subscribe('/competition/' + id + '/events/halftime/stop', function (data) {
        console.log(data);
        $("#match-time").text("45").data("time", 45).addClass("active");
        self.matchTimer = window.setInterval(self.updateMatchClock, self.TIMERINTERVAL);
    });
    client.subscribe('/competition/' + id + '/events/halftime/start', function (data) {
        console.log(data);
        $("#match-time").text("45").data("time", 45).removeClass("active");
        if (self.matchTimer) window.clearInterval(self.matchTimer);
    });
};
