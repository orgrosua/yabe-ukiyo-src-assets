<script setup>
import { ref, onBeforeMount, watch, computed } from 'vue';
import set from 'lodash-es/set';
import get from 'lodash-es/get';
import { useSettingStore } from '../../stores/setting';
import { storeToRefs } from 'pinia';

const settingStore = useSettingStore();

const { setting: option } = storeToRefs(settingStore);

const paymentStatus = [
    'abandoned',
    'refunded',
    'failed',
    'pending',
    'preapproved',
    'processing',
    'revoked',
    'payment_deleted',
    'item_removed',
];

const selectable = (o) => {
    return !get(option.value, 'ecommerce.easydigitaldownloads.deactivate_when_payment_status', []).includes(o)
        && !get(option.value, 'ecommerce.easydigitaldownloads.revoke_when_payment_status', []).includes(o);
};
</script>

<template>
    <table class="form-table" role="presentation">
        <tbody>
            <tr>
                <th scope="row"><label for="enable_integration">{{ __('Enable Integration', 'yabe-ukiyo') }}</label></th>
                <td>
                    <div class="">
                        <input type="checkbox" name="enable_integration" id="enable_integration" :checked="get(option, 'ecommerce.easydigitaldownloads.enable_integration', false)" :value="get(option, 'ecommerce.easydigitaldownloads.enable_integration', false)" @input="set(option, 'ecommerce.easydigitaldownloads.enable_integration', !option?.ecommerce?.easydigitaldownloads?.enable_integration)" class="mr:8">
                        <label for="enable_integration">{{ __('To enable integration, please tick this box.', 'yabe-ukiyo') }}</label>
                    </div>
                    <p class="description">{{ __('The Easy Digital Downloads integration module will be loaded.', 'yabe-ukiyo') }}</p>
                </td>
            </tr>

            <tr>
                <th scope="row"><label for="print_purchase_page">{{ __('Purchase Page', 'yabe-ukiyo') }}</label></th>
                <td>
                    <div class="">
                        <input type="checkbox" name="print_purchase_page" id="print_purchase_page" :checked="get(option, 'ecommerce.easydigitaldownloads.print_purchase_page', false)" :value="get(option, 'ecommerce.easydigitaldownloads.print_purchase_page', false)" @input="set(option, 'ecommerce.easydigitaldownloads.print_purchase_page', !option?.ecommerce?.easydigitaldownloads?.print_purchase_page)" class="mr:8">
                        <label for="print_purchase_page">{{ __('License detail on the purchase page.', 'yabe-ukiyo') }}</label>
                    </div>
                    <p class="description">{{ __('The license will be shown on the user\'s purchase history page.') }}</p>
                </td>
            </tr>

            <tr>
                <th scope="row"><label for="print_receipt_email">{{ __('Receipt Email', 'yabe-ukiyo') }}</label></th>
                <td>
                    <div class="">
                        <input type="checkbox" name="print_receipt_email" id="print_receipt_email" :checked="get(option, 'ecommerce.easydigitaldownloads.print_receipt_email', false)" :value="get(option, 'ecommerce.easydigitaldownloads.print_receipt_email', false)" @input="set(option, 'ecommerce.easydigitaldownloads.print_receipt_email', !option?.ecommerce?.easydigitaldownloads?.print_receipt_email)" class="mr:8">
                        <label for="print_receipt_email">{{ __('License detail on the receipt email.', 'yabe-ukiyo') }}</label>
                    </div>
                    <p class="description">{{ __('The license will be included in the receipt email for each successful purchase.') }}</p>
                </td>
            </tr>

            <tr>
                <th scope="row"><label for="payment_status_deactivate">{{ __('Deactivate when Payment Status :', 'yabe-ukiyo') }}</label></th>
                <td>
                    <VueSelect multiple :options="paymentStatus" :selectable="selectable" :modelValue="get(option, 'ecommerce.easydigitaldownloads.deactivate_when_payment_status', [])" @update:modelValue="(v) => set(option, 'ecommerce.easydigitaldownloads.deactivate_when_payment_status', v)" class="w:25em" />
                    <p class="description">{{ __('The license will be deactivated when the payment status changes from "Completed" to the following status.', 'yabe-ukiyo') }}</p>
                </td>
            </tr>

            <tr>
                <th scope="row"><label for="payment_status_activate">{{ __('Revoke when Payment Status :', 'yabe-ukiyo') }}</label></th>
                <td>
                    <VueSelect multiple :options="paymentStatus" :selectable="selectable" :modelValue="get(option, 'ecommerce.easydigitaldownloads.revoke_when_payment_status', [])" @update:modelValue="(v) => set(option, 'ecommerce.easydigitaldownloads.revoke_when_payment_status', v)" class="w:25em" />
                    <p class="description">{{ __('The license will be revoked or deleted when the payment status changes from "Completed" to the following status.', 'yabe-ukiyo') }}</p>
                </td>
            </tr>

        </tbody>
    </table>
</template>