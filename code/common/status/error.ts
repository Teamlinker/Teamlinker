export namespace Err {
    export const Common = {
        paramError:{
            code:1,
            msg:"param error"
        },
        mysqlError:{
            code:2,
            msg:"mysql error"
        },
        itemNotFound:{
            code:3,
            msg:"item not found"
        },
        itemExists:{
            code:4,
            msg:"item exists"
        },
        mysqlNotConfig:{
            code:5,
            msg:"mysql not config"
        },
        requestForbidden:{
            code:6,
            msg:"request forbidden"
        },
        admin:{
            code:7,
            msg:"user is admin"
        },
        interfaceForbidden:{
            code:8,
            msg:"interface is forbidden"
        }
    }
    export const User = {
        userNotFound:{
            code:1000,
            msg:"user not found"
        },
        userExists:{
            code:1001,
            msg:"user exists"
        },
        userIdNotExists:{
            code:1002,
            msg:"user id not exists"
        },
        userNameNotExists:{
            code:1003,
            msg:"user not found"
        },
        userPasswordWrong:{
            code:1004,
            msg:"user password wrong"
        },
        notAuth:{
            code:1005,
            msg:"user not auth"
        },
        accessDenied:{
            code:1006,
            msg:"access denied"
        },
        notInMeeting:{
            code:1007,
            msg:"not in meeting"
        },
        userNameNotMail:{
            code:1008,
            msg:"username is not email"
        },
        userCacheExpired:{
            code:1009,
            msg:"user cache expire"
        },
        codeNotMatch:{
            code:1010,
            msg:"code not match"
        },
        timeTooShort:{
            code:1011,
            msg:"time interval is too short"
        }
    }
    export const Http = {
        overFileSize:{
            code:2000,
            msg:"over file size"
        },
        requireParam:{
            code:2001,
            msg:"require param"
        },
        requireHeader:{
            code:2002,
            msg:"require header"
        }
    }
    export const Project = {
        userIdNotExists:{
            code:3000,
            msg:"project id not exists"
        },
        projectNotFound:{
            code:3001,
            msg:"project not found"
        },
        projectExists:{
            code:3002,
            msg:"project exists"
        },
        projectKeywordNotFound:{
            code:3003,
            msg:"project keyword not found"
        },
        projectIdNotMatch:{
            code:3004,
            msg:"project id not match"
        },
        projectKeywordDuplicate:{
            code:3004,
            msg:"project keyword duplicate"
        },
        Label:{
            labelSizeEmpty:{
                code:3100,
                msg:"tag size empty"
            },
            labelNotfound:{
                code:3101,
                msg:"tag not found"
            },
            labelIssueExists:{
                code:3102,
                msg:"tag issue exists"
            }
        },
        Module:{
            moduleNotFound:{
                code:3200,
                msg:"module not found"
            },
            moduleIssueExists:{
                code:3201,
                msg:"module issue exists"
            }
        },
        Member:{
            memberExists:{
                code:3300,
                msg:"member exists"
            },
            memberNotExists:{
                code:3301,
                msg:"member not exists"
            },
            memberNotMatch:{
                code:3302,
                msg:"member not match"
            }
        },
        Issue : {
            issueTypeNotFound:{
                code:3400,
                msg:"issue type not found"
            },
            issueTypeForbidden:{
                code:3401,
                msg:"issue type forbidden"
            },
            issueTypeSolutionExists :{
                code:3402,
                msg:"issue type solution exists"
            },
            issueTypeSolutionNotFound:{
                code:3403,
                msg:"issue type solution not found"
            },
            issueTypeSolutionForbidden:{
                code:3404,
                msg:"issue type solution forbidden"
            },
            issueTypeNotInIssueTypeSolution:{
                code:3405,
                msg:"issue type not in issue solution"
            },
            issueTypeSolutionBindProject:{
                code:3406,
                msg:"issue type solution bind project"
            }
        },
        Workflow:{
            workflowNotFound:{
                code:3500,
                msg:"workflow not found"
            },
            workflowForbidden:{
                code:3501,
                msg:"workflow forbidden"
            },
            workflowNodeNotFound:{
                code:3502,
                msg:"workflow node not found"
            },
            workflowNodeForbidden:{
                code:3503,
                msg:"workflow node forbidden"
            },
            workflowActionNotFound:{
                code:3504,
                msg:"workflow action not found"
            },
            workflowActionForbidden:{
                code:3505,
                msg:"workflow action forbidden"
            },
            workflowSolutionNotFound:{
                code:3506,
                msg:"workflow solution not found"
            },
            workflowSolutionForbidden:{
                code:3507,
                msg:"workflow solution forbidden"
            },
            workflowOpenNodeDuplicate:{
                code:3508,
                msg:"workflow open node duplicate"
            },
            workflowSolutionNotBindIssueTypeSolution:{
                code:3509,
                msg:"workflow solution not bind issue type solution"
            },
            workflowNotInWorkflowSolution:{
                code:3510,
                msg:"workflow not in workflow solution"
            },
            workflowNodeNotInWorkflow:{
                code:3511,
                msg:"worflow node not in workflow"
            },
            workflowAlreadyInWorkflowSolution:{
                code:3512,
                msg:"workflow already in workflow solution"
            },
            issueTypeSolutionDuplicate:{
                code:3513,
                msg:"issue type solution duplicate"
            },
            unbindReservedWorkflowSolutionForbidden:{
                code:3514,
                msg:"unbind reserved workflow solution forbidden"
            }
        },
        Field:{
            fieldTypeNotFound:{
                code:3600,
                msg:"field type not found"
            },
            fieldSolutionNotFound:{
                code:3601,
                msg:"field solution not found"
            },
            fieldSolutionWorkflowNodeFieldTypeNotFound:{
                code:3602,
                msg:"field solution workflow node field Type not found"
            },
            fieldTypeConfigValueIdNotFound:{
                code:3603,
                msg:"field type config value id not found"
            },
            workflowSolutionNotBind:{
                code:3604,
                msg:"workflow solution not bind"
            },
            workflowSolutionAlreadyBind:{
                code:3605,
                msg:"workflow solution already bind"
            },
            fieldTypeNotMatch:{
                code:3606,
                msg:"field type not match"
            },
            fieldConfigValueAlreadySelected: {
                code:3607,
                msg:"field config value already selected"
            }
        },
        ProjectIssue:{
            projectIssueNotFound:{
                code:3700,
                msg:"project issue not found"
            },
            uniqueKeyError:{
                code:3701,
                msg:"unique key error"
            },
            parentChildExists:{
                code:3702,
                msg:"parent child issue exists"
            },
            relatedExists:{
                code:3703,
                msg:"related issue exists"
            },
            issueProjectNotMatch:{
                code:3704,
                msg:"issue project not match"
            },
            issueEqualForbidden:{
                code:3705,
                msg:"issue equal forbidden"
            }
        },
        Release: {
            releaseNotFound:{
                code:3800,
                msg:"release not found"
            },
            releaseIssueDuplicate:{
                code:3801,
                msg:"release issue duplicate"
            },
            releaseSizeEmpty:{
                code:3802,
                msg:"release size empty"
            },
            releaseDateError:{
                code:3803,
                msg:"release date error"
            },
            releaseStartDateNotLessReleaseDate:{
                code:3804,
                msg:"release start date not less release date"
            }
        }
    }
    export const Team = {
        teamNotFound:{
            code:4000,
            msg:"team not found"
        },
        teamExists:{
            code:4001,
            msg:"team exists"
        },
        teamMemberExists:{
            code:4002,
            msg:"team member exists"
        },
        teamMemberNotExists:{
            code:4003,
            msg:"team member not exists"
        },
        removeForbidden:{
            code:4004,
            msg:"remove forbidden"
        }
    }
    export const Role ={
        roleNotFound:{
            code:5000,
            msg:"role not found"
        },
        roleNotExists:{
            code:5001,
            msg:"role not exists"
        },
        roleMemberEmpty:{
            code:5002,
            msg:"role member empty"
        },
        roleMemberExists:{
            code:5003,
            msg:"role member exists"
        },
        roleChangeForbidden:{
            code:5004,
            msg:"role change forbidden"
        }
    }
    export const File ={
        fileNotFound:{
            code:6000,
            msg:"file not found"
        },
        md5NotExists:{
            code:6001,
            msg:"md5 not exists"
        }
    }

    export const Content ={
        contentNotFound:{
            code:7000,
            msg:"comment not found"
        },
        contentTypeNotFound:{
            code:7001,
            msg:"comment type not found"
        },
        contentRefNotFound:{
            code:7002,
            msg:"comment ref not found"
        }
    }

    export const Organization = {
        ownerNotFound:{
            code:8000,
            msg:"owner not found"
        },
        organizationNotFound:{
            code:8001,
            msg:"organization not found"
        },
        userAlreadyExists:{
            code:8002,
            msg:"user already exists"
        },
        userNotFound:{
            code:8003,
            msg:"user not found"
        },
        ownerDeleteForbidden:{
            code:8004,
            msg:"owner delete forbidden"
        },
        nicknameEmpty:{
            code:8005,
            msg:"nickname empty"
        },
        notInOrganization:{
            code:8006,
            msg:"not in organization"
        },
        memberTagNotFound:{
            code:8007,
            msg:"member tag not found"
        },
        memberTagAlreadyExists:{
            code:8008,
            msg:"member tag already exists"
        }
    }

    export const Auth = {
        roleNotFound:{
            code:9000,
            msg:"role not found"
        },
        roleAlreadyExists: {
            code:9001,
            msg:"role already exists"
        }
    }

    export const Wiki ={
        wikiNotFound:{
            code:10000,
            msg:"wiki not found"
        },
        wikiItemNotFound:{
            code:10001,
            msg:"wiki item not found"
        }
    }

    export const Calendar ={
        calendarNotFound:{
            code:11000,
            msg:"calendar not found"
        },
        calendarEventNotFound:{
            code:11001,
            msg:"calendar event not found"
        },
        removeForbidden: {
            code:11002,
            msg:"calendar remove forbidden"
        },
        defaultCalendarDuplicate:{
            code:11003,
            msg:"default calendar duplicate"
        },
        settingNotFound:{
            code:11004,
            msg:"setting not found"
        },
        settingAlreadyExists:{
            code:11005,
            msg:"setting already exists"
        }
    }
    
    export const IM ={
        userNotFound:{
            code:12000,
            msg:"user not found"
        },
        teamNotFound:{
            code:12001,
            msg:"team not found"
        },
        messageNotFound:{
            code:12002,
            msg:"message not found"
        }
    }

    export const Meeting={
        roomNotFound:{
            code:13000,
            msg:"room not found"
        },
        roomStillActive:{
            code:13001,
            msg:"room still active"
        },
        privateRoomDeleteForbidden:{
            code:13002,
            msg:"private room delete forbidden"
        },
        endTimeLarger:{
            code:13003,
            msg:"start time less than end time"
        },
        startTimeLess:{
            code:13004,
            msg:"start time less than current time one hour"
        },
        passwordWrong:{
            code:13005,
            msg:"password wrong"
        },
        notInMeeting:{
            code:13006,
            msg:"not in meeting"
        },
        organizationUserNotFound:{
            code:13007,
            msg:"organization user not found"
        }
    }

    export const Finder={
        itemNotFound: {
            code:14000,
            msg:"item not found"
        },
        typeNotMatch:{
            code:14001,
            msg:"type not match"
        },
        recursionFolder:{
            code:14002,
            msg:"recursion folder"
        }
    }

    export const Notification={
        notificationNotFound:{
            code:15000,
            msg:"notification not found"
        },
        notificationStatusNotMatch:{
            code:15001,
            msg:"notification status not match"
        }
    }
}

