export namespace Err {
    export const Common = {
        paramError: {
            code: 1,
            msg: {
                en: "param error",
                zh: "参数错误"
            }
        },
        mysqlError: {
            code: 2,
            msg: {
                en: "mysql error",
                zh: "数据库错误"
            }
        },
        itemNotFound: {
            code: 3,
            msg: {
                en: "item not found",
                zh: "项目不存在"
            }
        },
        itemExists: {
            code: 4,
            msg: {
                en: "item exists",
                zh: "项目已存在"
            }
        },
        mysqlNotConfig: {
            code: 5,
            msg: {
                en: "mysql not config",
                zh: "数据库未配置"
            }
        },
        requestForbidden: {
            code: 6,
            msg: {
                en: "request forbidden",
                zh: "请求禁止访问"
            }
        },
        admin: {
            code: 7,
            msg: {
                en: "user is admin",
                zh: "用户是管理员"
            }
        },
        interfaceForbidden: {
            code: 8,
            msg: {
                en: "interface is forbidden",
                zh: "接口禁止访问"
            }
        }
    }
    export const User = {
        userNotFound: {
            code: 1000,
            msg: {
                en: "user not found",
                zh: "用户不存在"
            }
        },
        userExists: {
            code: 1001,
            msg: {
                en: "user exists",
                zh: "用户已存在"
            }
        },
        userIdNotExists: {
            code: 1002,
            msg: {
                en: "user id not exists",
                zh: "用户id不存在"
            }
        },
        userNameNotExists: {
            code: 1003,
            msg: {
                en: "user not found",
                zh: "用户名称不存在"
            }
        },
        userPasswordWrong: {
            code: 1004,
            msg: {
                en: "user password wrong",
                zh: "用户密码错误"
            }
        },
        notAuth: {
            code: 1005,
            msg: {
                en: "user not auth",
                zh: "未授权"
            }
        },
        accessDenied: {
            code: 1006,
            msg: {
                en: "access denied",
                zh: "禁止访问"
            }
        },
        notInMeeting: {
            code: 1007,
            msg: {
                en: "not in meeting",
                zh: "不在会议中"
            }
        },
        userNameNotMail: {
            code: 1008,
            msg: {
                en: "username is not email",
                zh: "用户名不是email"
            }
        },
        userCacheExpired: {
            code: 1009,
            msg: {
                en: "user cache expire",
                zh: "用户缓存过期"
            }
        },
        codeNotMatch: {
            code: 1010,
            msg: {
                en: "code not match",
                zh: "验证码不匹配"
            }
        },
        timeTooShort: {
            code: 1011,
            msg: {
                en: "time interval is too short",
                zh: "时间间隔太短"
            }
        },
        Tool: {
            StickyNote: {
                noteNotFound: {
                    code: 1100,
                    msg: {
                        en: "note not found",
                        zh: "便签不存在"
                    }
                }
            },
            Photo: {
                photoNotFound: {
                    code: 1200,
                    msg: {
                        en: "photo not found",
                        zh: "相册不存在"
                    }
                }
            }
        }
    }
    export const Http = {
        overFileSize: {
            code: 2000,
            msg: {
                en: "over file size",
                zh: "文件超过大小"
            }
        },
        requireParam: {
            code: 2001,
            msg: {
                en: "require param",
                zh: "缺少参数"
            }
        },
        requireHeader: {
            code: 2002,
            msg: {
                en: "require header",
                zh: "缺少参数头"
            }
        }
    }
    export const Project = {
        userIdNotExists: {
            code: 3000,
            msg: {
                en: "project id not exists",
                zh: "项目id不存在"
            }
        },
        projectNotFound: {
            code: 3001,
            msg: {
                en: "project not found",
                zh: "项目不存在"
            }
        },
        projectExists: {
            code: 3002,
            msg: {
                en: "project exists",
                zh: "项目已存在"
            }
        },
        projectKeywordNotFound: {
            code: 3003,
            msg: {
                en: "project keyword not found",
                zh: "项目id不存在"
            }
        },
        projectIdNotMatch: {
            code: 3004,
            msg: {
                en: "project id not match",
                zh: "项目id不匹配"
            }
        },
        projectKeywordDuplicate: {
            code: 3004,
            msg: {
                en: "project keyword duplicate",
                zh: "项目id重复"
            }
        },
        Label: {
            labelSizeEmpty: {
                code: 3100,
                msg: {
                    en: "tag size empty",
                    zh: "标签为空"
                }
            },
            labelNotfound: {
                code: 3101,
                msg: {
                    en: "tag not found",
                    zh: "标签不存在"
                }
            },
            labelIssueExists: {
                code: 3102,
                msg: {
                    en: "tag issue exists",
                    zh: "标签已经和工作项绑定"
                }
            }
        },
        Module: {
            moduleNotFound: {
                code: 3200,
                msg: {
                    en: "module not found",
                    zh: "模块不存在"
                }
            },
            moduleIssueExists: {
                code: 3201,
                msg: {
                    en: "module issue exists",
                    zh: "模块已经和工作项绑定"
                }
            }
        },
        Member: {
            memberExists: {
                code: 3300,
                msg: {
                    en: "member exists",
                    zh: "成员已存在"
                }
            },
            memberNotExists: {
                code: 3301,
                msg: {
                    en: "member not exists",
                    zh: "成员不存在"
                }
            },
            memberNotMatch: {
                code: 3302,
                msg: {
                    en: "member not match",
                    zh: "成员不匹配"
                }
            }
        },
        Issue: {
            issueTypeNotFound: {
                code: 3400,
                msg: {
                    en: "issue type not found",
                    zh: "工作项不存在"
                }
            },
            issueTypeForbidden: {
                code: 3401,
                msg: {
                    en: "issue type forbidden",
                    zh: "工作项禁止访问"
                }
            },
            issueTypeSolutionExists: {
                code: 3402,
                msg: {
                    en: "issue type solution exists",
                    zh: "工作项解决方案已存在"
                }
            },
            issueTypeSolutionNotFound: {
                code: 3403,
                msg: {
                    en: "issue type solution not found",
                    zh: "工作项解决方案不存在"
                }
            },
            issueTypeSolutionForbidden: {
                code: 3404,
                msg: {
                    en: "issue type solution forbidden",
                    zh: "工作项解决方案禁止访问"
                }
            },
            issueTypeNotInIssueTypeSolution: {
                code: 3405,
                msg: {
                    en: "issue type not in issue solution",
                    zh: "工作项类型不在工作项解决方案中"
                }
            },
            issueTypeSolutionBindProject: {
                code: 3406,
                msg: {
                    en: "issue type solution bind project",
                    zh: "工作项解决方案已和项目绑定"
                }
            },
            issueTypeSolutionSame: {
                code: 3407,
                msg: {
                    en: "issue type solution is same",
                    zh: "工作项解决方案重复"
                }
            },
            issueTypeSolutionConvertMissRelationship: {
                code: 3408,
                msg: {
                    en: "issue type solution miss relationship",
                    zh: "工作项解决方案缺少关联"
                }
            },
            issueTypeSolutionNotSame: {
                code: 3409,
                msg: {
                    en: "issue type solution is not same",
                    zh: "工作项解决方案不是同一个"
                }
            }
        },
        Workflow: {
            workflowNotFound: {
                code: 3500,
                msg: {
                    en: "workflow not found",
                    zh: "工作流不存在"
                }
            },
            workflowForbidden: {
                code: 3501,
                msg: {
                    en: "workflow forbidden",
                    zh: "工作流禁止访问"
                }
            },
            workflowNodeNotFound: {
                code: 3502,
                msg: {
                    en: "workflow node not found",
                    zh: "工作流节点不存在"
                }
            },
            workflowNodeForbidden: {
                code: 3503,
                msg: {
                    en: "workflow node forbidden",
                    zh: "工作流节点禁止访问"
                }
            },
            workflowActionNotFound: {
                code: 3504,
                msg: {
                    en: "workflow action not found",
                    zh: "工作流流转不存在"
                }
            },
            workflowActionForbidden: {
                code: 3505,
                msg: {
                    en: "workflow action forbidden",
                    zh: "工作流流转禁止访问"
                }
            },
            workflowOpenNodeDuplicate: {
                code: 3508,
                msg: {
                    en: "workflow open node duplicate",
                    zh: "工作流待办节点重复"
                }
            },
            approvalNotFound: {
                code: 3509,
                msg: {
                    en: "approval not found",
                    zh: "审批不存在"
                }
            }
        },
        Field: {
            fieldTypeNotFound: {
                code: 3600,
                msg: {
                    en: "field type not found",
                    zh: "字段类型不存在"
                }
            },
            fieldSolutionNotFound: {
                code: 3601,
                msg: {
                    en: "field solution not found",
                    zh: "字段方案不存在"
                }
            },
            fieldSolutionWorkflowNodeFieldTypeNotFound: {
                code: 3602,
                msg: {
                    en: "field solution workflow node field Type not found",
                    zh: "工作流字段类型不存在"
                }
            },
            fieldTypeConfigValueIdNotFound: {
                code: 3603,
                msg: {
                    en: "field type config value id not found",
                    zh: "字段类型配置不存在"
                }
            },
            fieldTypeNotMatch: {
                code: 3604,
                msg: {
                    en: "field type not match",
                    zh: "字段类型不匹配"
                }
            },
        },
        ProjectIssue: {
            projectIssueNotFound: {
                code: 3700,
                msg: {
                    en: "project issue not found",
                    zh: "工作项不存在"
                }
            },
            uniqueKeyError: {
                code: 3701,
                msg: {
                    en: "unique key error",
                    zh: "工作项不存在"
                }
            },
            parentChildExists: {
                code: 3702,
                msg: {
                    en: "parent child issue exists",
                    zh: "已存在父子关系"
                }
            },
            relatedExists: {
                code: 3703,
                msg: {
                    en: "related issue exists",
                    zh: "已存在关联关系"
                }
            },
            issueProjectNotMatch: {
                code: 3704,
                msg: {
                    en: "issue project not match",
                    zh: "工作项不匹配"
                }
            },
            issueEqualForbidden: {
                code: 3705,
                msg: {
                    en: "issue equal forbidden",
                    zh: "工作项不能为同一个"
                }
            },
            issueShouldEmpty: {
                code: 3706,
                msg: {
                    en: "issue should be empty",
                    zh: "工作项不能为空"
                }
            }
        },
        Release: {
            releaseNotFound: {
                code: 3800,
                msg: {
                    en: "release not found",
                    zh: "发布不存在"
                }
            },
            releaseIssueDuplicate: {
                code: 3801,
                msg: {
                    en: "release issue duplicate",
                    zh: "工作项重复"
                }
            },
            releaseSizeEmpty: {
                code: 3802,
                msg: {
                    en: "release size empty",
                    zh: "发布为空"
                }
            },
            releaseDateError: {
                code: 3803,
                msg: {
                    en: "release date error",
                    zh: "发布时间错误"
                }
            },
            releaseStartDateNotMoreThanReleaseDate: {
                code: 3804,
                msg: {
                    en: "release start date not large release date",
                    zh: "发布开始时间不能大于发布时间"
                }
            }
        },
        Board: {
            boardNotFound: {
                code: 3900,
                msg: {
                    en: "board not found",
                    zh: "面板不存在"
                }
            },
            boardSprintNotFound: {
                code: 3901,
                msg: {
                    en: "board sprint not found",
                    zh: "冲刺不存在"
                }
            },
            boardColumnNotFound: {
                code: 3902,
                msg: {
                    en: "board column not found",
                    zh: "列不存在"
                }
            },
            boardSprintSwimLaneNotFound: {
                code: 3903,
                msg: {
                    en: "board sprint swim lane not found",
                    zh: "泳道不存在"
                }
            },
            boardNotIncludeIssueType: {
                code: 3904,
                msg: {
                    en: "board not include issue type",
                    zh: "面板为包含该工作项类型"
                }
            }
        },
        Plan:{
            planNotFound:{
                code:3920,
                msg:{
                    en:"plan not found",
                    zh:"计划不存在"
                }
            },
            planItemNotFound:{
                code:3921,
                msg:{
                    en:"plan item not found",
                    zh:"计划项目不存在"
                }
            },
            planTypeNotMatched:{
                code:3922,
                msg:{
                    en:"plan type not matched",
                    zh:"计划的类型不匹配"
                }
            },
            dependItemNotMatchedParentItem:{
                code:3923,
                msg:{
                    en:"depend item not matched parent item",
                    zh:"依赖项需要和是父项目的子项目"
                }
            },
            operationForbidden:{
                code:3924,
                msg:{
                    en:"operation is forbidden",
                    zh:"禁止该操作"
                }
            }
        }
    }
    export const Team = {
        teamNotFound: {
            code: 4000,
            msg: {
                en: "team not found",
                zh: "团队不存在"
            }
        },
        teamExists: {
            code: 4001,
            msg: {
                en: "team exists",
                zh: "团队已存在"
            }
        },
        teamMemberExists: {
            code: 4002,
            msg: {
                en: "team member exists",
                zh: "团队成员已存在"
            }
        },
        teamMemberNotExists: {
            code: 4003,
            msg: {
                en: "team member not exists",
                zh: "团队成员不存在"
            }
        },
        removeForbidden: {
            code: 4004,
            msg: {
                en: "remove forbidden",
                zh: "禁止删除"
            }
        }
    }
    export const Role = {
        roleNotFound: {
            code: 5000,
            msg: {
                en: "role not found",
                zh: "角色不存在"
            }
        },
        roleNotExists: {
            code: 5001,
            msg: {
                en: "role not exists",
                zh: "角色不存在"
            }
        },
        roleMemberEmpty: {
            code: 5002,
            msg: {
                en: "role member empty",
                zh: "角色成员为空"
            }
        },
        roleMemberExists: {
            code: 5003,
            msg: {
                en: "role member exists",
                zh: "角色成员已存在"
            }
        },
        roleChangeForbidden: {
            code: 5004,
            msg: {
                en: "role change forbidden",
                zh: "禁止修改角色"
            }
        }
    }
    export const File = {
        fileNotFound: {
            code: 6000,
            msg: {
                en: "file not found",
                zh: "文件不存在"
            }
        },
        md5NotExists: {
            code: 6001,
            msg: {
                en: "md5 not exists",
                zh: "md5不存在"
            }
        }
    }

    export const Content = {
        contentNotFound: {
            code: 7000,
            msg: {
                en: "content not found",
                zh: "内容不存在"
            }
        },
        contentTypeNotFound: {
            code: 7001,
            msg: {
                en: "content type not found",
                zh: "内容类型不存在"
            }
        },
        contentRefNotFound: {
            code: 7002,
            msg: {
                en: "content ref not found",
                zh: "内容指向不存在"
            }
        }
    }

    export const Organization = {
        ownerNotFound: {
            code: 8000,
            msg: {
                en: "owner not found",
                zh: "拥有者不存在"
            }
        },
        organizationNotFound: {
            code: 8001,
            msg: {
                en: "organization not found",
                zh: "组织不存在"
            }
        },
        userAlreadyExists: {
            code: 8002,
            msg: {
                en: "user already exists",
                zh: "用户已存在"
            }
        },
        userNotFound: {
            code: 8003,
            msg: {
                en: "user not found",
                zh: "用户不存在"
            }
        },
        ownerDeleteForbidden: {
            code: 8004,
            msg: {
                en: "owner delete forbidden",
                zh: "拥有者不能删除"
            }
        },
        nicknameEmpty: {
            code: 8005,
            msg: {
                en: "nickname empty",
                zh: "昵称为空"
            }
        },
        notInOrganization: {
            code: 8006,
            msg: {
                en: "not in organization",
                zh: "不在组织里"
            }
        },
        memberTagNotFound: {
            code: 8007,
            msg: {
                en: "member tag not found",
                zh: "用户标签不存在"
            }
        },
        memberTagAlreadyExists: {
            code: 8008,
            msg: {
                en: "member tag already exists",
                zh: "用户标签已存在"
            }
        },
        ownerQuitForbidden: {
            code: 8009,
            msg: {
                en: "owner quit forbidden",
                zh: "拥有者不能退出"
            }
        },
    }

    export const Auth = {
        roleNotFound: {
            code: 9000,
            msg: {
                en: "role not found",
                zh: "角色不存在"
            }
        },
        roleAlreadyExists: {
            code: 9001,
            msg: {
                en: "role already exists",
                zh: "角色已存在"
            }
        }
    }

    export const Wiki = {
        wikiNotFound: {
            code: 10000,
            msg: {
                en: "wiki not found",
                zh: "文档集合不存在"
            }
        },
        wikiItemNotFound: {
            code: 10001,
            msg: {
                en: "wiki item not found",
                zh: "文档不存在"
            }
        }
    }

    export const Calendar = {
        calendarNotFound: {
            code: 11000,
            msg: {
                en: "calendar not found",
                zh: "日历不存在"
            }
        },
        calendarEventNotFound: {
            code: 11001,
            msg: {
                en: "calendar event not found",
                zh: "日历事件不存在"
            }
        },
        removeForbidden: {
            code: 11002,
            msg: {
                en: "calendar remove forbidden",
                zh: "禁止删除日历"
            }
        },
        defaultCalendarDuplicate: {
            code: 11003,
            msg: {
                en: "default calendar duplicate",
                zh: "默认日历重复"
            }
        },
        settingNotFound: {
            code: 11004,
            msg: {
                en: "setting not found",
                zh: "配置未找到"
            }
        },
        settingAlreadyExists: {
            code: 11005,
            msg: {
                en: "setting already exists",
                zh: "配置已存在"
            }
        }
    }

    export const IM = {
        userNotFound: {
            code: 12000,
            msg: {
                en: "user not found",
                zh: "用户不存在"
            }
        },
        teamNotFound: {
            code: 12001,
            msg: {
                en: "team not found",
                zh: "团队不存在"
            }
        },
        messageNotFound: {
            code: 12002,
            msg: {
                en: "message not found",
                zh: "消息不存在"
            }
        },
        messageAlreadyFavorite: {
            code: 12003,
            msg: {
                en: "message already favorite",
                zh: "已经是收藏消息了"
            }
        }
    }

    export const Meeting = {
        roomNotFound: {
            code: 13000,
            msg: {
                en: "room not found",
                zh: "会议不存在"
            }
        },
        roomStillActive: {
            code: 13001,
            msg: {
                en: "room still active",
                zh: "会议还未结束"
            }
        },
        privateRoomDeleteForbidden: {
            code: 13002,
            msg: {
                en: "private room delete forbidden",
                zh: "不能删除私人会议"
            }
        },
        endTimeLarger: {
            code: 13003,
            msg: {
                en: "start time less than end time",
                zh: "开始时间应该小于结束时间"
            }
        },
        startTimeLess: {
            code: 13004,
            msg: {
                en: "start time less than current time one hour",
                zh: "开始时间不能小于当前时间前一个小时"
            }
        },
        passwordWrong: {
            code: 13005,
            msg: {
                en: "password wrong",
                zh: "密码错误"
            }
        },
        notInMeeting: {
            code: 13006,
            msg: {
                en: "not in meeting",
                zh: "不在会议中"
            }
        },
        organizationUserNotFound: {
            code: 13007,
            msg: {
                en: "organization user not found",
                zh: "用户不存在"
            }
        }
    }

    export const Finder = {
        itemNotFound: {
            code: 14000,
            msg: {
                en: "item not found",
                zh: "文件不存在"
            }
        },
        typeNotMatch: {
            code: 14001,
            msg: {
                en: "type not match",
                zh: "类型不匹配"
            }
        },
        recursionFolder: {
            code: 14002,
            msg: {
                en: "recursion folder",
                zh: "递归文件夹"
            }
        }
    }

    export const Notification = {
        notificationNotFound: {
            code: 15000,
            msg: {
                en: "notification not found",
                zh: "通知不存在"
            }
        },
        notificationStatusNotMatch: {
            code: 15001,
            msg: {
                en: "notification status not match",
                zh: "通知状态不匹配"
            }
        }
    }
}

