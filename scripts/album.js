var playButtonTemplate = '<a class="album-song-button"><span class="ion-ios-play"></span></a>';

var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';

var playerBarPlayButton = '<span class="ion-ios-play"></span>'

var playerBarPauseButton = '<span class="ion-pause"></span>'

var currentAlbum = null;

var currentlyPlayingSongNumber = null;

var currentSongFromAlbum = null;

var currentSoundFile = null;

var currentVolume = 80;

var setSong = function (songNumber) {

    if ( currentSoundFile ) {

        currentSoundFile.stop();
    }

    currentlyPlayingSongNumber = parseInt(songNumber);

    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];

    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {

        formats: [ 'mp3' ],

        preload: true
    });

    setVolume(currentVolume);
};

var setVolume = function(volume) {
    if (currentSoundFile) {

        currentSoundFile.setVolume(volume);
    }
};

var seek = function(time) {

    if (currentSoundFile) {

        currentSoundFile.setTime(time);
    }
};

var getSongNumberCell = function (number) {

    return $('.song-item-number[data-song-number="' + number + '"]');
};

var createSongRow = function(songNumber, songName, songLength) {
    var template =
        '<tr class="album-view-song-item">'
      + '	<td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
      + '  	<td class="song-item-title">' + songName + '</td>'
      + '  	<td class="song-item-duration">' + songLength + '</td>'
      + '</tr>'
      ;

	var $row = $(template);

	var clickHandler = function () {

		var songNumber = parseInt($(this).attr('data-song-number'));

		if (currentlyPlayingSongNumber !== null) {
			// Revert to song number for currently playing song because user started playing new song.

			var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);

			currentlyPlayingCell.html(currentlyPlayingSongNumber);
		}

		if (currentlyPlayingSongNumber !== songNumber) {

			// Switch from Play -> Pause button to indicate new song is playing.
			$(this).html(pauseButtonTemplate);

			setSong(songNumber);

            currentSoundFile.play();

            updateSeekBarWhileSongPlays();

            var volumeFill = $('.volume .fill');

            var volumeThumb = $('.volume .thumb');

            volumeFill.width(currentVolume + '%');

            volumeThumb.css({left: currentVolume + '%'});

            updatePlayerBarSong();

		} else if (currentlyPlayingSongNumber === songNumber) {

			// Switch from Pause -> Play button to pause currently playing song.
            if ( currentSoundFile.isPaused()) {

                $(this).html(pauseButtonTemplate);

                $('.main-controls .play-pause').html(playerBarPauseButton);

                currentSoundFile.play();

            } else {

                $(this).html(playButtonTemplate);

                $('.main-controls .play-pause').html(playerBarPlayButton);

                currentSoundFile.pause();

            }
		}
	};

	var onHover = function (e) {

		var songNumberCell = $(this).find('.song-item-number');

		var songNumber = parseInt(songNumberCell.attr('data-song-number'));

		if (songNumber !== currentlyPlayingSongNumber) {

			songNumberCell.html(playButtonTemplate);
		}
	};

	var offHover = function (e) {

		var songNumberCell = $(this).find('.song-item-number');

        var songNumber = parseInt(songNumberCell.attr('data-song-number'));

        if (songNumber !== currentlyPlayingSongNumber) {

            songNumberCell.html(songNumber);
        }
	};

	$row.find('.song-item-number').click(clickHandler);

	$row.hover(onHover, offHover);

	return $row;

    console.log("songNumber type is " + typeof songNumber + "\n and currentlyPlayingSongNumber type is " + typeof currentlyPlayingSongNumber);

};

var setCurrentAlbum = function(album) {

	currentAlbum = album;

	var $albumTitle = $('.album-view-title');
	var $albumArtist = $('.album-view-artist');
	var $albumReleaseInfo = $('.album-view-release-info');
	var albumImage = $('.album-cover-art');
	var $albumSongList = $('.album-view-song-list');

	$albumTitle.text(album.title);
	$albumArtist.text(album.artist);
	$albumReleaseInfo.text(album.year + ' ' + album.label);
	albumImage.attr('src', album.albumArtUrl);

    $albumSongList.empty();

	for (var i = 0; i < album.songs.length; i++) {

	var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);

	$albumSongList.append($newRow);
	}
};

var updateSeekBarWhileSongPlays = function() {

    if (currentSoundFile) {
        // #10
        currentSoundFile.bind('timeupdate', function(event) {
            // #11
            var seekBarFillRatio = this.getTime() / this.getDuration();

            var seekBar = $('.seek-control .seek-bar');

            updateSeekPercentage(seekBar, seekBarFillRatio);

            setCurrentTimeInPlayerBar();
            });
        }
    };

var updateSeekPercentage = function(seekBar, seekBarFillRatio) {

    var offsetXPercent = seekBarFillRatio * 100;
    // #1
    offsetXPercent = Math.max(0, offsetXPercent);

    offsetXPercent = Math.min(100, offsetXPercent);

    // #2
    var percentageString = offsetXPercent + '%';

    seekBar.find('.fill').width(percentageString);

    seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {

    var seekBars = $('.player-bar .seek-bar');

    seekBars.click(function(event) {
        // #3
        var offsetX = event.pageX - $(this).offset().left;

        var barWidth = $(this).width();
        // #4
        var seekBarFillRatio = offsetX / barWidth;

        if ($(this).parent().attr('class') == 'seek-control') {

            seek(seekBarFillRatio * currentSoundFile.getDuration());

        } else {

            setVolume(seekBarFillRatio * 100);
        }
        // #5
        updateSeekPercentage($(this), seekBarFillRatio);
    });

    seekBars.find('.thumb').mousedown(function(event) {
         // #8
         var seekBar = $(this).parent();
         // #9
         $(document).bind('mousemove.thumb', function(event){

            var offsetX = event.pageX - seekBar.offset().left;

            var barWidth = seekBar.width();

            var seekBarFillRatio = offsetX / barWidth;

            if (seekBar.parent().attr('class') == 'seek-control') {

            seek(seekBarFillRatio * currentSoundFile.getDuration());

            } else {

            setVolume(seekBarFillRatio);
            }

            updateSeekPercentage(seekBar, seekBarFillRatio);
         });
         // #10
         $(document).bind('mouseup.thumb', function() {

             $(document).unbind('mousemove.thumb');

             $(document).unbind('mouseup.thumb');
         });
     });
};

var trackIndex = function (album, song) {

    return album.songs.indexOf(song);
}

var updatePlayerBarSong = function () {

    $('.currently-playing .song-name').text(currentSongFromAlbum.title);

    $('.currently-playing .artist-name').text(currentAlbum.artist);

    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);

    if (currentSoundFile.isPaused()) {

        $('.main-controls .play-pause').html(playerBarPlayButton);
    } else {

        $('.main-controls .play-pause').html(playerBarPauseButton);
    }


}

var nextSong = function() {

    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);

    // Note that we're _incrementing_ the song here
    currentSongIndex++;

    if (currentSongIndex >= currentAlbum.songs.length) {

        currentSongIndex = 0;
    }

    // Save the last song number before changing it
    var lastSongNumber = currentlyPlayingSongNumber;

    // Set a new current song
    setSong(currentSongIndex + 1);

    currentSoundFile.play();

    updateSeekBarWhileSongPlays();

    currentSongFromAlbum = currentAlbum.songs[currentSongIndex];

    // Update the Player Bar information
    updatePlayerBarSong();

    var nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);

    var lastSongNumberCell = getSongNumberCell(lastSongNumber);

    nextSongNumberCell.html(pauseButtonTemplate);

    lastSongNumberCell.html(lastSongNumber);
};

var previousSong = function() {

    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);

    // Note that we're _decrementing_ the index here
    currentSongIndex--;

    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }

    // Save the last song number before changing it
    var lastSongNumber = currentlyPlayingSongNumber;

    // Set a new current song
    setSong(currentSongIndex + 1);

    currentSoundFile.play();

    updateSeekBarWhileSongPlays();

    currentSongFromAlbum = currentAlbum.songs[currentSongIndex];

    // Update the Player Bar information
    updatePlayerBarSong();

    $('.main-controls .play-pause').html(playerBarPauseButton);

    var previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);

    var lastSongNumberCell = getSongNumberCell(lastSongNumber);

    previousSongNumberCell.html(pauseButtonTemplate);

    lastSongNumberCell.html(lastSongNumber);
};

var previousButton = $('.main-controls .previous');

var nextButton = $('.main-controls .next');

var playPauseButton = $('.main-controls .play-pause');

var togglePlayFromPlayerBar = function () {

    if ( currentSoundFile == null ) {

        return;
    }

    var songNumberCell = getSongNumberCell(currentlyPlayingSongNumber);

    if ( currentSoundFile.isPaused() ) {

        songNumberCell.html(pauseButtonTemplate);

        currentSoundFile.play();

    } else {

        songNumberCell.html(playButtonTemplate);

        currentSoundFile.pause();
    }

    updatePlayerBarSong();
};

var setCurrentTimeInPlayerBar = function () {

    var runningTime = function () {

            var time = currentSoundFile.getTime();

            var minutes = Math.floor(time / 60);

            var seconds = Math.floor(time - minutes * 60);

            if (minutes < 1 && seconds < 10) {

                return '0:0' + seconds;

            } else {

                return minutes + ":" + seconds;
            }
        };

        $('.current-time').html(runningTime);

    var songTime = function () {

        var time = currentSoundFile.getDuration();

        var minutes = Math.floor(time / 60);

        var seconds = Math.floor(time - minutes * 60);

        return minutes + ":" + seconds;
    };

    $('.total-time').html(songTime);

};

$(document).ready(function() {

     setCurrentAlbum(albumPicasso);

     setupSeekBars();

     previousButton.click(previousSong);

     nextButton.click(nextSong);

     playPauseButton.click(togglePlayFromPlayerBar);

});

var albums = [albumPicasso, albumMarconi, albumKennedy];

var index = 1;

var albumImage = $('.album-cover-art');

albumImage.click(function(){

    setCurrentAlbum(albums[index]);

    index++;

    if (index == albums.length){

     index = 0;
    }
});
