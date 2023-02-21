
export function processResults(results: { [uuid: string]: Entry }): TableInfo {
    // bin each by username, replacing with the largest timestamp
    let entriesByUser = Object.values(results).reduce((acc, entry) => {
        const oldTimestamp = acc[entry.username]?.timestamp || 0;

        if (oldTimestamp < entry.timestamp) {
            acc[entry.username] = entry;
        }
        return acc;
    }, {} as { [user: string]: Entry });

    // Collect headers and flatten info into rows
    let { headers, rows } = Object.values(entriesByUser).reduce(
        (acc, entry) => {
            let row: { [label: string]: number | string } = { username: entry.username };

            for (let dataset in entry.datasets) {
                for (let [metric, value] of Object.entries(entry.datasets[dataset])) {
                    let label = `${dataset} ${metric}`;
                    acc.headers.add(label);
                    row[label] = value;
                }
            }
            acc.rows.push(row);
            return acc;
        },
        { headers: new Set<string>(), rows: [] as { [label: string]: any }[] }
    );

    const labels = Array.from(headers).sort();
    labels.unshift('username');
    return { labels, rows };
}

export function capitalize(str:string):string {
    if (str.length == 0) {return str}
    return str[0].toUpperCase() + str.slice(1)
}

export function kebab2Text(str:string):string {
    return str.split("-").map(capitalize).join(" ")
}

export function text2Kebab(str:string): string {
    return str.split(" ").map(s => s.toLowerCase()).join("-")
}