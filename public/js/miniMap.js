
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/streets-v11', 
center: coliving.geometry.coordinates, 
zoom: 4, 
projection: 'globe' 
});

for(let coliving of allColivings) {
    new mapboxgl.Marker()
    .setLngLat(coliving.geometry.coordinates)
    .addTo(map)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
        .setHTML(
            `<strong><p id="name">${coliving.name}</p></strong>
            <p>${coliving.city}, ${coliving.country}</p>
            <a href="${coliving.url}" target="_blank">Visit website</a>
            <a href="/coliving/${coliving._id}">More info</a>`
        )
    )
}
