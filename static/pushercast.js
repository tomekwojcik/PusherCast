(function() {
  window.Events.bind(window, 'load', function(e) {
    var $, Pusher, author, channel, getAuthor, publishMessage, pusherClient;
    window.bonzo.aug({
      bind: function(event, handler) {
        return window.Events.bind(this.original, event, handler);
      },
      disable: function() {
        this.original.disabled = true;
        return this;
      },
      enable: function() {
        this.original.disabled = false;
        return this;
      }
    });
    $ = function(selector) {
      return window.bonzo(window.Sly.find(selector));
    };
    Pusher = window.Pusher;
    author = 'Bilbo';
    getAuthor = function() {
      var oldAuthor;
      if (author !== null) {
        oldAuthor = author;
      } else {
        oldAuthor = '';
      }
      author = null;
      while (author === null) {
        author = prompt("Your name:", oldAuthor);
        if (author === null && oldAuthor !== '') {
          author = oldAuthor;
        }
        if (author === '') {
          author = null;
        }
      }
      $('#publish span').text(author);
      return $('#publish input[name=author]').val(author);
    };
    $('#publish a').bind('click', function(e) {
      getAuthor();
      return false;
    });
    getAuthor();
    pusherClient = new Pusher(window.PusherKey);
    channel = pusherClient.subscribe('PusherCast');
    channel.bind('message', function(message) {
      var div, html;
      div = window.bonzo(document.createElement('div'));
      html = '<p><span class="author">' + message['author'] + ':</span> ' + message['content'] + '</p>';
      html += '<p class="date">' + message['created_at'] + '</p>';
      div.addClass('message').html(html);
      return div.insertAfter(document.getElementById('publish'));
    });
    publishMessage = function() {
      var data, request;
      if ($('#publish textarea').val() !== '') {
        data = 'author=' + window.encodeURIComponent($('#publish span').text()) + '&content=' + window.encodeURIComponent($('#publish textarea').val());
        return request = window.reqwest({
          url: window.location.href,
          method: 'post',
          type: 'text',
          data: data,
          before: function() {
            return $('#publish textarea').disable();
          },
          complete: function() {
            return $('#publish textarea').enable();
          },
          success: function(response) {
            if (response.responseText === 'OK') {
              return $('#publish textarea').val('');
            } else {
              return alert(response.responseText);
            }
          },
          error: function() {
            return alert('Connection error!');
          }
        });
      }
    };
    $('#publish textarea').bind('keydown', function(e) {
      if (e.eventObject().keyCode === 13) {
        publishMessage();
        e.stopPropagation();
        return e.cancelDefault();
      }
    });
    return true;
  });
}).call(this);
