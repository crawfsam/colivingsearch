
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/streets-v11', 
center: [0, 0], 
zoom: 1, 
projection: 'globe' 
});

for(let coliving of colivings) {

    if(coliving.reviews.length > 0) {
        ratings = 0
        n = 0
        for (let review of coliving.reviews) {
        ratings += review.rating 
        n++
        }
        averageRating = Math.round(ratings/n);
    }

    
    let marker = new mapboxgl.Marker()

    .setLngLat(coliving.geometry.coordinates)
    .addTo(map)
    if(coliving.reviews.length > 0) {
        marker.setPopup(
            new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<strong><p class="m-0" id="name">${coliving.name}</p></strong>
                <p class="m-0" >${coliving.city}, ${coliving.country}</p>
                <p class="starability-result" data-rating="${averageRating}">
                </p>
                <img class="mapbox-img" src="${coliving.images[0].url}">
                <a href="/coliving/${coliving._id}">More info</a>`
            )
        )
    } else {
        marker.setPopup(
            new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<strong><p class="m-0" id="name">${coliving.name}</p></strong>
                <p class="m-0" >${coliving.city}, ${coliving.country}</p>
                <a href="/coliving/${coliving._id}">No reviews yet, be the first!</a>
                <img class="mapbox-img" src="${coliving.images[0].url}">
                <a href="/coliving/${coliving._id}">More info</a>`
            )
        )
    }
}
