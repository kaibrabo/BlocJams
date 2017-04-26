var buildCollectionItemTemplate = function (title, artist, songCount) {

	var template =
			'<div class="collection-album-container column fourth">'
		+ '  <img src="assets/images/album_covers/01.png"/>'
		+ '  <div class="collection-album-info caption">'
		+ '    <p>'
		+ '      <a class="album-name" href="album.html">' + title +' </a>'
		+ '      <br/>'
		+ '      <a href="album.html"> '+artist+' </a>'
		+ '      <br/>'
		+ '      '+ songCount +' songs'
		+ '      <br/>'
		+ '    </p>'
		+ '  </div>'
		+ '</div>'
		;

		return $(template);
		//function returns the markup string as a jQuery object, which we'll call a jQuery template.
};



$(window).on('load', function(){

	var $collectionContainer = $('.album-covers');

	$collectionContainer.empty();

	var albumArray = [
		{
			title: "Get Home Safely",
			artist: "Dom Kennedy",
			songCount: 12
		},
		{
			title: "Dom Kennedy",
			artist: "Dom Kennedy",
			songCount: 12
		},
		{
			title: "The Original Dom Kennedy",
			artist: "Dom Kennedy",
			songCount: 12
		}
	];

	for (var i = 0; i < albumArray.length; i++){

		var album = albumArray[i];

		var $newThumbnail = buildCollectionItemTemplate(album.title, album.artist, album.songCount);

		$collectionContainer.append($newThumbnail);
	}

});
