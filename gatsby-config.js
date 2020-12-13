module.exports = {
    plugins: [
        'gatsby-plugin-react-helmet',
        'gatsby-plugin-offline',
        'gatsby-plugin-postcss',
        `gatsby-plugin-ts-config`,
        {
            resolve: 'gatsby-plugin-manifest',
            options: {
                name: 'pdf-shuffler-online',
                start_url: '/',
                icon: 'static/favicon.png',
                crossOrigin: `use-credentials`,
            },
        },
    ],
}
