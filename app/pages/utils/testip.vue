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
        <div class="surface-section text-center mb-1">
            <div class="mb-3 font-bold text-3xl">
                <span class="text-blue-600">{{ t('TEST IP') }}</span>
            </div>
        </div>
        <div class="surface-section  text-center mb-5">
            <BlockUI :blocked="blocked">
                <div class="grid">
                    <div class="col-12 md:col-12 mb-12 px-5">
                        <div class="field">
                            <label for="ip">{{ t('IP') }}</label>
                            <InputText id="ip" v-model="ip" class="w-full" />
                        </div>
                    </div>
                    <div class="col-12 flex justify-content-center">
                        <Button :label="t('Test IP')" icon="pi pi-check" @click="testIP" />
                    </div>
                </div>
            </BlockUI>
            <div v-if="resultIP" v-html="resultIP"
                class="w-auto h-auto text-0 surface-800 text-left text-sm p-2">
            </div>
        </div>
    </div>
    <div class="card">
        <div class="surface-section text-center mb-1">
            <div class="mb-3 font-bold text-3xl">
                <span class="text-blue-600">{{ t('TEST Rango IP') }}</span>
            </div>
        </div>
        <div class="surface-section  text-center mb-5">
            <BlockUI :blocked="blocked">
                <div class="grid">
                    <div class="col-12 md:col-12 mb-12 px-5">
                        <div class="field">
                            <label for="ipRange">{{ t('IP') }}</label>
                            <InputText id="ipRange" v-model="ipRange" class="w-full" />
                        </div>
                    </div>
                    <div class="col-12 md:col-12 mb-12 px-5">
                        <div class="field">
                            <label for="rango">{{ t('Rango') }}</label>
                            <Textarea id="rango" v-model="rango" class="w-full" rows="5" />
                        </div>
                    </div>
                    <div class="col-12 flex justify-content-center">
                        <Button :label="t('Test Rango IP')" icon="pi pi-check" @click="testIPRange" />
                    </div>
                </div>
            </BlockUI>
            <div v-if="resultIPRange" v-html="resultIPRange"
                class="w-auto h-auto text-0 surface-800 text-left text-sm p-2">
            </div>
        </div>
    </div>
</template>
