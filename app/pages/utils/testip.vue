<script setup lang='ts'>
import { useConfirm } from 'primevue/useconfirm';
import TestService from '~/services/testService';

const { showMessage, removeGroup } = useMessages();
const { t } = useI18n();

const testService = new TestService();
const resultIP = ref();
const resultIPRange = ref();

const testIP = async () => {
    blocked.value = true;
    resultIP.value = '';
    showMessage('info', t('Test IP'), t('Comprobando IP...'), -1, 'tc');
    const response = await testService.testIP({ ip: ip.value });
    removeGroup('tc');
    if (checkLogged(response)) {
        resultIP.value = response?.data?.value?.message;
    } else {
        showMessage('error', t('Error'), response?.data?.value?.message, -1);
    }
    blocked.value = false;
};

const testIPRange = async () => {
    blocked.value = true;
    resultIPRange.value = '';
    showMessage('info', t('Test Rango IP'), t('Comprobando Rango IP...'), -1, 'tc');
    const response = await testService.testIP({ ip: ipRange.value, rango: rango.value });
    removeGroup('tc');
    if (checkLogged(response)) {
        resultIPRange.value = response?.data?.value?.message;
    } else {
        showMessage('error', t('Error'), response?.data?.value?.message, -1);
    }
    blocked.value = false;
};

const ip = ref('');
const ipRange = ref('');
const rango = ref('');

const blocked = ref(false);

</script>

<template>
    <div class="card">
        <div class="grid grid-cols-12 p-1">
            <div class="col-span-12">
                <h4>{{ t('TEST IP') }}</h4>
                <BlockUI :blocked="blocked">
                    <div class="grid grid-cols-1 gap-4">
                        <div class="col-span-1 md:col-span-1 mb-12 px-5">
                            <FloatLabel variant="on">
                                <InputText id="ip" v-model="ip" class="w-full" />
                                <label for="ip">{{ t('IP')
                                }}</label>
                            </FloatLabel>
                        </div>
                        <div class="col-span-1 flex justify-center">
                            <Button :label="t('Test IP')" icon="pi pi-check" @click="testIP" />
                        </div>
                    </div>
                </BlockUI>
                <div v-if="resultIP" v-html="resultIP"
                    class="w-auto h-auto text-white bg-gray-800 text-left text-sm p-2 rounded">
                </div>
            </div>
        </div>
    </div>
    <div class="card">
        <div class="grid grid-cols-12 p-1">
            <div class="col-span-12">
                <h4>{{ t('TEST Rango IP') }}</h4>
                <BlockUI :blocked="blocked">
                    <div class="grid grid-cols-1 gap-4">
                        <div class="col-span-1 md:col-span-1 mb-12 px-5">
                            <FloatLabel variant="on">
                                <InputText id="ipRange" v-model="ipRange" class="w-full" />
                                <label for="ipRange">{{
                                    t('IP') }}</label>
                            </FloatLabel>
                        </div>
                        <div class="col-span-1 md:col-span-1 mb-12 px-5">
                            <FloatLabel variant="on">
                                <label for="rango">{{
                                    t('Rango') }}</label>
                                <Textarea id="rango" v-model="rango" class="w-full" rows="5" />
                            </FloatLabel>
                        </div>
                        <div class="col-span-1 flex justify-center">
                            <Button :label="t('Test Rango IP')" icon="pi pi-check" @click="testIPRange" />
                        </div>
                    </div>
                </BlockUI>
                <div v-if="resultIPRange" v-html="resultIPRange"
                    class="w-auto h-auto text-white bg-gray-800 text-left text-sm p-2 rounded">
                </div>
            </div>
        </div>
    </div>
</template>
