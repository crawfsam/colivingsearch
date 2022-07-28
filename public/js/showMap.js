
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/streets-v11', // style URL
center: [0, 0], // starting position [lng, lat]
zoom: 1, // starting zoom
projection: 'globe' // display the map as a 3D globe
});

for(let coliving of colivings) {
    new mapboxgl.Marker()
    .setLngLat(coliving.geometry.coordinates)
    .addTo(map)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
        .setHTML(
            `<p>${coliving.name}</p>
            <p>${coliving.city},${coliving.country}</p>
            <a href="${coliving.url} target=_blank">Visit website</a>`
        )
    )
}
