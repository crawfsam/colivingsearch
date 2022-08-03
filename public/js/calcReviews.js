const rating = document.getElementById('rating')

if(coliving.reviews.length > 0) {
    ratings = 0
    n = 0
    for (let review of coliving.reviews) {
        ratings += review.rating 
        n++
    }
    const averageRating = Math.round(ratings/n)

    rating.innerHTML = `
    <h4>Rating: </h4>
    <p class="starability-result" data-rating="${averageRating}">
                </p>
    `

} else {
    rating.innerHTML = `
    <h4>Rating: </h4>
    <p>No reviews yet </P>`
}