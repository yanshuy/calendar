
export function validatePath() {
    const path = location.pathname
    const parts = path.split("/")
    if (parts.length < 3) {
        updateUrl(new Date())
    }
    const year = Number(parts[parts.length - 3]);
    const month = Number(parts[parts.length - 2]);
    const day = Number(parts[parts.length - 1]);

    if (isNaN(year) || isNaN(month) || isNaN(day) ||
        month < 1 || month > 12 || day < 1 || day > 31) {
        updateUrl(new Date())
    }

    if (month < 10 && parts[parts.length - 2][0] != "0") {
        const date = getDateFromUrl()
        updateUrl(date)
    }
}

// function parseUrl(url: string) {
//     const [path, queryString] = url.split("?");
//     const params = new URLSearchParams(queryString)

//     const parts = path.split("/")
//     return {
//         date: parts.slice(-3)
//     }
// }

export function getDateFromUrl() {
    const path = location.pathname
    const parts = path.split("/")

    const year = Number(parts[parts.length - 3]);
    const month = Number(parts[parts.length - 2]);
    const day = Number(parts[parts.length - 1]);

    return new Date(year, month - 1, day);
}

export function updateUrl(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const path = `/${year}/${month.toString().padStart(2, '0')}/${day}`;
    const url = location.origin + path + location.hash

    window.history.pushState({}, '', url);
};
