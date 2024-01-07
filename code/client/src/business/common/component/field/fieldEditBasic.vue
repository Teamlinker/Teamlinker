<template>
  <span style="display: inline-block;width: 100%;cursor: text" @mouseenter="onEnter" @mouseleave="onLeave" tabindex="-1"
        @focus="onFocus" ref="element">
    <FieldEditBasicName :is-edit="isEdit" :show-value="showValue as string" :project-issue-id="projectIssueId"
                        v-if="type==EClient_Field_Basic_Type.NAME" @update="onUpdate"
                        @cancel="onBlur"></FieldEditBasicName>
    <FieldEditBasicDescription :is-edit="isEdit" :show-value="showValue as string" :project-issue-id="projectIssueId"
                               v-if="type==EClient_Field_Basic_Type.DESCRIPTION" @update="onUpdate"
                               @cancel="onBlur"></FieldEditBasicDescription>
    <FieldEditBasicAssigner :is-edit="isEdit" :show-value="showValue as User" :project-issue-id="projectIssueId"
                            v-if="type==EClient_Field_Basic_Type.ASSIGNER" @update="onUpdate"
                            @cancel="onBlur"></FieldEditBasicAssigner>
    <FieldEditBasicReporter :is-edit="isEdit" :show-value="showValue as User" :project-issue-id="projectIssueId"
                            v-if="type==EClient_Field_Basic_Type.REPORTER" @update="onUpdate"
                            @cancel="onBlur"></FieldEditBasicReporter>
    <FieldEditBasicPriority :is-edit="isEdit" :show-value="showValue as ECommon_Model_Project_Issue_Priority"
                            :project-issue-id="projectIssueId" v-if="type==EClient_Field_Basic_Type.PRIORITY"
                            @update="onUpdate" @cancel="onBlur"></FieldEditBasicPriority>
    <FieldEditBasicLabel :is-edit="isEdit" :show-value="showValue as ICommon_Model_Project_Label[]"
                         :project-issue-id="projectIssueId" v-if="type==EClient_Field_Basic_Type.LABEL"
                         @update="onUpdate" @cancel="onBlur"></FieldEditBasicLabel>
    <FieldEditBasicModule :is-edit="isEdit" :show-value="showValue as ICommon_Model_Project_Module[]"
                          :project-issue-id="projectIssueId" v-if="type==EClient_Field_Basic_Type.MODULE"
                          @update="onUpdate" @cancel="onBlur"></FieldEditBasicModule>
    <FieldEditBasicFixVersion :is-edit="isEdit" :show-value="showValue as DCSType<ICommon_Model_Project_Release>[]"
                              :project-issue-id="projectIssueId" v-if="type==EClient_Field_Basic_Type.FIXVERSIONS"
                              @update="onUpdate" @cancel="onBlur"></FieldEditBasicFixVersion>
	  <FieldEditBasicSprint :is-edit="isEdit" :show-value="showValue as {
			id:string,
			name:string
	  }" :project-issue-id="projectIssueId" v-if="type==EClient_Field_Basic_Type.SPRINT" @update="onUpdate"
	                        @cancel="onBlur"></FieldEditBasicSprint>
	  <FieldEditBasicManDay :is-edit="isEdit" :show-value="showValue as number" :project-issue-id="projectIssueId"
	                        v-if="type==EClient_Field_Basic_Type.MANDAY" @update="onUpdate"
	                        @cancel="onBlur"></FieldEditBasicManDay>
	  <FieldEditBasicPlan :is-edit="isEdit" :show-value="showValue as DCSType<ICommon_Model_Plan>[]"
	                            :project-issue-id="projectIssueId" v-if="type==EClient_Field_Basic_Type.PLANS"
	                            @update="onUpdate" @cancel="onBlur"></FieldEditBasicPlan>
  </span>
</template>

<script setup lang="ts">
import {EClient_Field_Basic_Type} from "./fieldBasicType";
import {ICommon_Model_Project_Label} from "../../../../../../common/model/project_label";
import {ICommon_Model_Project_Module} from "../../../../../../common/model/project_module";
import {inject, ref, watch} from "vue";

import {ECommon_Model_Project_Issue_Priority} from "../../../../../../common/model/project_issue";
import {injectProjectInfo} from "../../util/symbol";
import {checkPermission, Permission_Types} from "../../../../../../common/permission/permission";
import {ICommon_Model_Project_Release} from "../../../../../../common/model/project_release";
import FieldEditBasicName from "./basic/fieldEditBasicName.vue";
import FieldEditBasicDescription from "./basic/fieldEditBasicDescription.vue";
import FieldEditBasicAssigner from "./basic/fieldEditBasicAssigner.vue";
import FieldEditBasicPriority from "./basic/fieldEditBasicPriority.vue";
import FieldEditBasicReporter from "./basic/fieldEditBasicReporter.vue";
import FieldEditBasicLabel from "./basic/fieldEditBasicLabel.vue";
import FieldEditBasicModule from "./basic/fieldEditBasicModule.vue";
import FieldEditBasicFixVersion from "./basic/fieldEditBasicFixVersion.vue";
import FieldEditBasicSprint from "@/business/common/component/field/basic/fieldEditBasicSprint.vue";
import {DCSType} from "../../../../../../common/types";
import FieldEditBasicManDay from "@/business/common/component/field/basic/fieldEditBasicManDay.vue";
import {ICommon_Model_Plan} from "../../../../../../common/model/plan";
import FieldEditBasicPlan from "@/business/common/component/field/basic/fieldEditBasicPlan.vue";

type User = {
	id: string,
	organizationUserId?: string,
	photo?: string,
	nickname?: string
}
type Value =
	string
	| ECommon_Model_Project_Issue_Priority
	| User
	| ICommon_Model_Project_Label[]
	| ICommon_Model_Project_Module[]
	| number
	| ICommon_Model_Project_Release[]
type Props = {
	projectIssueId: string
} & (
	{
		type: EClient_Field_Basic_Type.NAME | EClient_Field_Basic_Type.DESCRIPTION,
		value?: string
	} | {
	type: EClient_Field_Basic_Type.PRIORITY,
	value?: ECommon_Model_Project_Issue_Priority
} | {
	type: EClient_Field_Basic_Type.ASSIGNER | EClient_Field_Basic_Type.REPORTER,
	value?: User
} | {
	type: EClient_Field_Basic_Type.LABEL,
	value?: ICommon_Model_Project_Label[]
} | {
	type: EClient_Field_Basic_Type.MODULE,
	value?: ICommon_Model_Project_Module[]
} | {
	type: EClient_Field_Basic_Type.FIXVERSIONS,
	value?: ICommon_Model_Project_Release[]
} | {
	type: EClient_Field_Basic_Type.SPRINT,
	value?: {
		id: string,
		name: string
	}
} | {
	type: EClient_Field_Basic_Type.MANDAY,
	value?: number
} | {
	type: EClient_Field_Basic_Type.PLANS,
	value?: ICommon_Model_Plan[]
})
const props = defineProps<Props>()
const element = ref<HTMLSpanElement>(null)
const showValue = ref(props.value)
const permission = inject(injectProjectInfo).permission
const isEdit = ref(false)
watch(() => props.value, (newValue, oldValue) => {
	showValue.value = props.value
}, {
	immediate: true,
	deep: true
})
const onEnter = (event: MouseEvent) => {
	if (!isEdit.value) {
		const ele = event.currentTarget as HTMLElement
		ele.style.backgroundColor = "rgb(230,231,237)"
	}
}
const onLeave = (event: MouseEvent) => {
	const ele = event.currentTarget as HTMLElement
	ele.style.backgroundColor = ""
}
const onFocus = async (event: MouseEvent) => {
	if (checkPermission(permission.value, Permission_Types.Project.EDIT)) {
		isEdit.value = true
		const ele = event.currentTarget as HTMLElement
		ele.style.backgroundColor = ""
	}
}
const onBlur = async () => {
	isEdit.value = false
}

const onUpdate = (value) => {
	showValue.value = value
	isEdit.value = false
}

</script>

<style scoped>

</style>