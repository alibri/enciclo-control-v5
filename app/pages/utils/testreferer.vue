<script setup lang='ts'>
import { useConfirm } from 'primevue/useconfirm';
import TestService from '~/services/testService';

const { showMessage, removeGroup } = useMessages();
const { t } = useI18n();

const testService = new TestService();
const resultReferer = ref();
const resultRefererReferer = ref();

const testReferer = async () => {
    blocked.value = true;
    resultReferer.value = '';
    showMessage('info', t('Test Configuración'), t('Comprobando Configuración...'), -1, 'tc');
    const response = await testService.testReferer({ referer: referer.value, rango: rango.value });
    removeGroup('tc');
    if (checkLogged(response)) {
        resultReferer.value = response?.data?.value?.message;
    } else {
        showMessage('error', t('Error'), response?.data?.value?.message, -1);
    }
    blocked.value = false;
};

const testRefererReferer = async () => {
    blocked.value = true;
    resultRefererReferer.value = '';
    showMessage('info', t('Test Referer'), t('Comprobando Referer...'), -1, 'tc');
    const response = await testService.testReferer({ referer: referersingle.value });
    removeGroup('tc');
    if (checkLogged(response)) {
        resultRefererReferer.value = response?.data?.value?.message;
    } else {
        showMessage('error', t('Error'), response?.data?.value?.message, -1);
    }
    blocked.value = false;
};

const referer = ref('');
const rango = ref('');
const referersingle = ref('');

const blocked = ref(false);

</script>
    
<template>
    <div class="card">
        <div class="surface-section text-center mb-1">
            <div class="mb-3 font-bold text-3xl">
                <span class="text-blue-600">{{ t('TEST Referer') }}</span>
            </div>
        </div>
        <div class="surface-section  text-center mb-5">
            <BlockUI :blocked="blocked">
                <div class="grid">
                    <div class="col-12 md:col-12 mb-12 px-5">
                        <div class="field">
                            <label for="referer">{{ t('Referer') }}</label>
                            <InputText id="referer" v-model="referersingle" class="w-full" />
                        </div>
                    </div>
                    <div class="col-12 flex justify-content-center">
                        <Button :label="t('Test Referer')" icon="pi pi-check" @click="testRefererReferer" />
                    </div>
                </div>
            </BlockUI>
            <div v-if="resultRefererReferer" v-html="resultRefererReferer"
                class="w-auto h-auto text-0 surface-800 text-left text-sm p-2    ">
            </div>
        </div>
    </div>
    <div class="card">
        <div class="surface-section text-center mb-1">
            <div class="mb-3 font-bold text-3xl">
                <span class="text-blue-600">{{ t('TEST Configuración') }}</span>
            </div>
        </div>
        <div class="surface-section  text-center mb-5">
            <BlockUI :blocked="blocked">
                <div class="grid">
                    <div class="col-12 md:col-12 mb-12 px-5">
                        <div class="field">
                            <label for="referer">{{ t('Referer') }}</label>
                            <InputText id="referer" v-model="referer" class="w-full" />
                        </div>
                    </div>
                    <div class="col-12 md:col-12 mb-12 px-5">
                        <div class="field">
                            <label for="rango">{{ t('Rango') }}</label>
                            <Textarea id="rango" v-model="rango" class="w-full" rows="5" />
                        </div>
                    </div>
                    <div class="col-12 flex justify-content-center">
                        <Button :label="t('Test Configuración')" icon="pi pi-check" @click="testReferer" />
                    </div>
                </div>
            </BlockUI>
            <div v-if="resultReferer" v-html="resultReferer"
                class="w-auto h-auto text-0 surface-800 text-left text-sm p-2    ">
            </div>
        </div>
    </div>
</template>

<style scoped></style>
