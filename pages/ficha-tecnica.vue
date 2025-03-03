<template>
    <div>
        <div v-if="status === 'success'" id="loaded-content" class="absolute -top-1 -left-1"></div>
        <div id="ficha-content">
            <h1>Ficha Técnica</h1>
            <pre>
                {{ data }}
            </pre>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    layout: "ficha-tecnica"
})

const route = useRoute();

const { error, data, execute, status } = useFetch(`https://admin.niguafreezone.com/items/products/${route.query.productID}`, {
    method: "GET",
    immediate: false,
    watch: false,
    transform(data) {
        return data.data
    },
    onResponse(res) {
        // console.log('onResponse', res.response)
    },
    onRequestError(err) {
        console.log('onRequestError', err)
    },
    onResponseError(err) {
        console.log('onResponseError', err)
    }
})

execute();
</script>