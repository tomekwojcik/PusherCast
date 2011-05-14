window.Events.bind(window, 'load', (e) -> 
    window.bonzo.aug({
        bind: (event, handler) ->
            window.Events.bind(this.original, event, handler)
        disable: ->
            this.original.disabled = true
            this
        enable: ->
            this.original.disabled = false
            this
    })
    
    $ = (selector) ->
        window.bonzo(window.Sly.find(selector))
        
    Pusher = window.Pusher
    
    author = 'Bilbo'
    getAuthor = ->
        if author != null
            oldAuthor = author
        else
            oldAuthor = ''
        
        author = null
        while author == null
            author = prompt("Your name:", oldAuthor)
            if author == null and oldAuthor != ''
                author = oldAuthor
            
            if author == ''
                author = null
                
        $('#publish span').text(author)
        $('#publish input[name=author]').val(author)
    
    $('#publish a').bind('click', (e) -> 
        getAuthor()
        false
    )
    getAuthor()
    
    pusherClient = new Pusher(window.PusherKey)
    channel = pusherClient.subscribe('PusherCast')
    channel.bind('message', (message) -> 
        div = window.bonzo(document.createElement('div'));
        html = '<p><span class="author">' + message['author'] + ':</span> ' + message['content'] + '</p>'
        html += '<p class="date">' + message['created_at'] + '</p>'
        div.addClass('message').html(html)
        div.insertAfter(document.getElementById('publish'))
    )
    
    publishMessage = ->
        if $('#publish textarea').val() != ''
            data = 'author=' + window.encodeURIComponent($('#publish span').text()) + '&content=' + window.encodeURIComponent($('#publish textarea').val())
            request = window.reqwest({
                url: window.location.href,
                method: 'post',
                type: 'text',
                data: data,
                before: ->
                    $('#publish textarea').disable()
                complete: ->
                    $('#publish textarea').enable()
                success: (response) ->
                    if response.responseText == 'OK'
                        $('#publish textarea').val('')
                    else
                        alert(response.responseText)
                error: ->
                    alert('Connection error!')
            })
    
    $('#publish textarea').bind('keydown', (e) -> 
        if e.eventObject().keyCode == 13
            publishMessage()
            e.stopPropagation()
            e.cancelDefault()
    )
    true
)