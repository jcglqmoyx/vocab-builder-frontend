import axios from "axios";

export async function updateUser(username, email, avatar, current_book_id, daily_count, times_counted_as_known, review_frequency_formula) {
    try {
        const token = localStorage.getItem("token");
        const serverLink = localStorage.getItem("server_link");
        const url = serverLink + '/user/update'
        const response = await axios.put(url, {
            username,
            email,
            avatar,
            current_book_id,
            daily_count,
            times_counted_as_known,
            review_frequency_formula,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data
    } catch (error) {
        console.error('Error fetching data from backend:', error);
    }
}
