import * as yup from 'yup';

function createController(createdModel, createdView) {
    const {
        addLink,
        removeLink,
        getLinks,
        getFeeds,
        getPosts,
        downloadRss,
    } = createdModel;
    const {
        renewState,
        addDescription,
        getDescription,
    } = createdView;

    const form = document.getElementById('form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const input = document.getElementById('url-input');
        const value = input.value;

        validate(value)
            .then(() => downloadRss(value))
            .then(() => {
                sendSuccess(value);
                form.reset();
            })
            .catch((error) => sendError(error));
    })

    function refreshPosts() {
        return new Promise(() => {
            getLinks().map((link) => {
                downloadRss(link)
                    .then(() => {
                        const feeds = getFeeds();
                        const posts = getPosts();

                        const newState = { feeds: feeds, posts: posts };
                        renewState(newState);
                        setTimeout(() => refreshPosts(), 5000);
                    })
                    .catch((error) => {
                        throw error;
                    })
            })
        })
    }

    function validate(value) {
        yup.setLocale({
            string: {
                url: 'error.address',
            },
            mixed: {
                required: 'error.empty',
                notOneOf: 'error.oneOf',
            }
        });

        const schema = yup.string()
            .url()
            .required()
            .notOneOf(getLinks())

        return schema.validate(value)
            .then()
            .catch((error) => {
                throw error;
            })
    }


    function sendError(error) {
        const errorMessage = error.message;
        const newState = { valid: false, error: errorMessage };
        renewState(newState);
    }

    function sendSuccess(value) {
        addLink(value);
        const feeds = getFeeds();
        const posts = getPosts();

        const newState = { valid: true, feeds: feeds, posts: posts }
        renewState(newState);
        refreshPosts();
    }
}

export default createController;
